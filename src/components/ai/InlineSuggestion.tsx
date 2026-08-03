import { Extension, type Editor } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { generateInlineSuggestion } from "@/lib/ai/rag-pipeline"
import { llmClient } from "@/lib/ai/llm-client"

export interface InlineSuggestionState {
  active: boolean
  type: "continue" | "rephrase"
  status: "idle" | "loading" | "streaming" | "ready" | "error"
  originalText: string
  suggestedText: string
  from: number
  to: number
  error?: string
}

const initialSuggestionState: InlineSuggestionState = {
  active: false,
  type: "continue",
  status: "idle",
  originalText: "",
  suggestedText: "",
  from: 0,
  to: 0,
}

export const inlineSuggestionPluginKey = new PluginKey<InlineSuggestionState>("inlineSuggestion")

// Active AbortController for stream cancellation
let activeAbortController: AbortController | null = null

export const InlineSuggestionExtension = Extension.create({
  name: "inlineSuggestion",

  addStorage() {
    return {
      state: initialSuggestionState,
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Space": () => {
        return triggerContinuation(this.editor)
      },
      "Ctrl-Space": () => {
        return triggerContinuation(this.editor)
      },
      "Mod-Shift-r": () => {
        return triggerRephrase(this.editor)
      },
      "Ctrl-Shift-r": () => {
        return triggerRephrase(this.editor)
      },
      Tab: () => {
        const state = inlineSuggestionPluginKey.getState(this.editor.state)
        if (
          state?.active &&
          (state.status === "ready" || state.status === "streaming") &&
          state.suggestedText
        ) {
          acceptSuggestion(this.editor, state)
          return true
        }
        return false
      },
      Escape: () => {
        const state = inlineSuggestionPluginKey.getState(this.editor.state)
        if (state?.active) {
          rejectSuggestion(this.editor)
          return true
        }
        return false
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<InlineSuggestionState>({
        key: inlineSuggestionPluginKey,
        state: {
          init() {
            return initialSuggestionState
          },
          apply(tr, prevState) {
            const meta = tr.getMeta(inlineSuggestionPluginKey)
            if (meta) {
              if (meta.type === "set") {
                return { ...prevState, ...meta.data }
              }
              if (meta.type === "clear") {
                if (activeAbortController) {
                  activeAbortController.abort()
                  activeAbortController = null
                }
                return initialSuggestionState
              }
            }

            // Dismiss active suggestion if user moves cursor or edits document (except via our meta updates)
            if (prevState.active && tr.docChanged && !meta) {
              return initialSuggestionState
            }

            return prevState
          },
        },
        props: {
          decorations(state) {
            const pluginState = inlineSuggestionPluginKey.getState(state)
            if (!pluginState || !pluginState.active) {
              return DecorationSet.empty
            }

            const decos: Decoration[] = []

            if (pluginState.type === "continue") {
              const widgetEl = document.createElement("span")
              widgetEl.className =
                "ghost-text-widget inline-flex items-center gap-1.5 ml-1 select-none pointer-events-none"

              if (pluginState.status === "loading") {
                widgetEl.innerHTML = `
                  <span class="ghost-text-loading text-brass/70 italic text-sm animate-pulse font-mono">
                    ✦ Thinking continuation...
                  </span>
                `
              } else {
                const textSpan = document.createElement("span")
                textSpan.className =
                  "ghost-text-content text-brass/80 italic bg-brass/10 border-b border-dashed border-brass/50 px-1 rounded-xs font-serif"
                textSpan.textContent = pluginState.suggestedText

                const badgeSpan = document.createElement("span")
                badgeSpan.className =
                  "ghost-text-badge text-[10px] uppercase font-mono tracking-wider text-parchment/70 bg-ink/90 border border-slate-line px-1.5 py-0.5 rounded shadow-xs ml-1"
                badgeSpan.textContent = "Tab ↵ Accept • Esc ✕ Reject"

                widgetEl.appendChild(textSpan)
                widgetEl.appendChild(badgeSpan)
              }

              decos.push(Decoration.widget(pluginState.from, widgetEl, { side: 1 }))
            } else if (pluginState.type === "rephrase") {
              // Highlight original selected text
              if (pluginState.from < pluginState.to) {
                decos.push(
                  Decoration.inline(pluginState.from, pluginState.to, {
                    class:
                      "rephrase-original-highlight bg-oxblood/30 text-parchment line-through rounded-xs px-0.5",
                  })
                )
              }

              const widgetEl = document.createElement("span")
              widgetEl.className =
                "rephrase-widget inline-flex items-center gap-1.5 ml-2 select-none pointer-events-none"

              if (pluginState.status === "loading") {
                widgetEl.innerHTML = `
                  <span class="rephrase-loading text-moss/80 italic text-sm animate-pulse font-mono">
                    ✦ Rephrasing selection...
                  </span>
                `
              } else {
                const textSpan = document.createElement("span")
                textSpan.className =
                  "rephrase-content text-moss font-medium bg-moss/15 border border-moss/40 px-1.5 py-0.5 rounded-xs font-serif shadow-xs"
                textSpan.textContent = `➜ ${pluginState.suggestedText}`

                const badgeSpan = document.createElement("span")
                badgeSpan.className =
                  "ghost-text-badge text-[10px] uppercase font-mono tracking-wider text-parchment/70 bg-ink/90 border border-slate-line px-1.5 py-0.5 rounded shadow-xs ml-1"
                badgeSpan.textContent = "Tab ↵ Accept • Esc ✕ Reject"

                widgetEl.appendChild(textSpan)
                widgetEl.appendChild(badgeSpan)
              }

              decos.push(Decoration.widget(pluginState.to, widgetEl, { side: 1 }))
            }

            return DecorationSet.create(state.doc, decos)
          },
        },
      }),
    ]
  },
})

function triggerContinuation(editor: Editor): boolean {
  if (llmClient.getStatus() !== "ready") {
    console.warn("Inline suggestion requires LLM model to be loaded first.")
    return false
  }

  const { state } = editor
  const { selection } = state
  const pos = selection.from

  // Extract preceding text context (up to ~1000 characters)
  const startPos = Math.max(0, pos - 1000)
  const contextText = state.doc.textBetween(startPos, pos, "\n", "\n")

  if (!contextText.trim()) {
    return false
  }

  if (activeAbortController) {
    activeAbortController.abort()
  }
  activeAbortController = new AbortController()

  // Set initial state
  editor.view.dispatch(
    editor.state.tr.setMeta(inlineSuggestionPluginKey, {
      type: "set",
      data: {
        active: true,
        type: "continue",
        status: "loading",
        originalText: "",
        suggestedText: "",
        from: pos,
        to: pos,
      },
    })
  )

  let accumulatedText = ""

  generateInlineSuggestion({
    type: "continue",
    contextText,
    signal: activeAbortController.signal,
    onToken: (token) => {
      accumulatedText += token
      if (editor.view && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(inlineSuggestionPluginKey, {
            type: "set",
            data: {
              status: "streaming",
              suggestedText: accumulatedText,
            },
          })
        )
      }
    },
  })
    .then((finalText) => {
      if (editor.view && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(inlineSuggestionPluginKey, {
            type: "set",
            data: {
              status: "ready",
              suggestedText: finalText || accumulatedText,
            },
          })
        )
      }
    })
    .catch((err) => {
      if (err.name === "AbortError") return
      console.error("Inline continuation error:", err)
      if (editor.view && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(inlineSuggestionPluginKey, {
            type: "set",
            data: {
              status: "error",
              error: err.message || "Failed to generate continuation",
            },
          })
        )
      }
    })

  return true
}

function triggerRephrase(editor: Editor): boolean {
  if (llmClient.getStatus() !== "ready") {
    console.warn("Inline rephrase requires LLM model to be loaded first.")
    return false
  }

  const { state } = editor
  const { selection } = state
  const { from, to } = selection

  if (from === to) {
    return false
  }

  const selectionText = state.doc.textBetween(from, to, " ")
  if (!selectionText.trim()) {
    return false
  }

  if (activeAbortController) {
    activeAbortController.abort()
  }
  activeAbortController = new AbortController()

  editor.view.dispatch(
    editor.state.tr.setMeta(inlineSuggestionPluginKey, {
      type: "set",
      data: {
        active: true,
        type: "rephrase",
        status: "loading",
        originalText: selectionText,
        suggestedText: "",
        from,
        to,
      },
    })
  )

  let accumulatedText = ""

  generateInlineSuggestion({
    type: "rephrase",
    contextText: selectionText,
    selectionText,
    signal: activeAbortController.signal,
    onToken: (token) => {
      accumulatedText += token
      if (editor.view && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(inlineSuggestionPluginKey, {
            type: "set",
            data: {
              status: "streaming",
              suggestedText: accumulatedText,
            },
          })
        )
      }
    },
  })
    .then((finalText) => {
      if (editor.view && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(inlineSuggestionPluginKey, {
            type: "set",
            data: {
              status: "ready",
              suggestedText: finalText || accumulatedText,
            },
          })
        )
      }
    })
    .catch((err) => {
      if (err.name === "AbortError") return
      console.error("Inline rephrase error:", err)
      if (editor.view && !editor.isDestroyed) {
        editor.view.dispatch(
          editor.state.tr.setMeta(inlineSuggestionPluginKey, {
            type: "set",
            data: {
              status: "error",
              error: err.message || "Failed to generate rephrase",
            },
          })
        )
      }
    })

  return true
}

function acceptSuggestion(editor: Editor, state: InlineSuggestionState) {
  const { type, suggestedText, from, to } = state
  if (!suggestedText) return

  if (type === "continue") {
    editor.chain().focus().insertContentAt(from, suggestedText).run()
  } else if (type === "rephrase") {
    editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, suggestedText).run()
  }

  // Clear suggestion state
  editor.view.dispatch(
    editor.state.tr.setMeta(inlineSuggestionPluginKey, {
      type: "clear",
    })
  )
}

function rejectSuggestion(editor: Editor) {
  editor.view.dispatch(
    editor.state.tr.setMeta(inlineSuggestionPluginKey, {
      type: "clear",
    })
  )
}
