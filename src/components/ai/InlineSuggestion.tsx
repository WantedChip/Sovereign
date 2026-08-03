import { Extension, type Editor } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import { generateInlineSuggestion } from "@/lib/ai/rag-pipeline"
import { llmClient } from "@/lib/ai/llm-client"
import { createAIBranch, acceptBranch, rejectBranch, type AIBranch } from "@/lib/crdt/ai-branch"
import type * as Y from "yjs"

export interface InlineSuggestionState {
  active: boolean
  type: "continue" | "rephrase"
  status: "idle" | "loading" | "streaming" | "ready" | "error"
  originalText: string
  suggestedText: string
  from: number
  to: number
  error?: string
  aiBranch?: AIBranch
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
      "Mod-Shift-Enter": () => {
        const state = inlineSuggestionPluginKey.getState(this.editor.state)
        if (state?.active && state.suggestedText) {
          acceptSuggestion(this.editor, state)
          return true
        }
        return false
      },
      "Ctrl-Shift-Enter": () => {
        const state = inlineSuggestionPluginKey.getState(this.editor.state)
        if (state?.active && state.suggestedText) {
          acceptSuggestion(this.editor, state)
          return true
        }
        return false
      },
      "Mod-Shift-Backspace": () => {
        const state = inlineSuggestionPluginKey.getState(this.editor.state)
        if (state?.active) {
          rejectSuggestion(this.editor)
          return true
        }
        return false
      },
      "Ctrl-Shift-Backspace": () => {
        const state = inlineSuggestionPluginKey.getState(this.editor.state)
        if (state?.active) {
          rejectSuggestion(this.editor)
          return true
        }
        return false
      },
      "Mod-Shift-g": () => {
        return regenerateSuggestion(this.editor)
      },
      "Ctrl-Shift-g": () => {
        return regenerateSuggestion(this.editor)
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
    const editor = this.editor

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

            const createActionButtons = () => {
              const btnGroup = document.createElement("span")
              btnGroup.className =
                "inline-flex items-center gap-1 ml-1.5 select-auto pointer-events-auto"

              const acceptBtn = document.createElement("button")
              acceptBtn.type = "button"
              acceptBtn.className =
                "text-[10px] uppercase font-mono tracking-wider text-moss bg-moss/20 hover:bg-moss/30 border border-moss/40 px-1.5 py-0.5 rounded shadow-xs cursor-pointer transition-colors"
              acceptBtn.textContent = "✓ Accept"
              acceptBtn.onmousedown = (e) => {
                e.preventDefault()
                e.stopPropagation()
                const current = inlineSuggestionPluginKey.getState(editor.state)
                if (current) acceptSuggestion(editor, current)
              }

              const rejectBtn = document.createElement("button")
              rejectBtn.type = "button"
              rejectBtn.className =
                "text-[10px] uppercase font-mono tracking-wider text-parchment/80 bg-oxblood/20 hover:bg-oxblood/30 border border-oxblood/40 px-1.5 py-0.5 rounded shadow-xs cursor-pointer transition-colors"
              rejectBtn.textContent = "✗ Reject"
              rejectBtn.onmousedown = (e) => {
                e.preventDefault()
                e.stopPropagation()
                rejectSuggestion(editor)
              }

              const regenBtn = document.createElement("button")
              regenBtn.type = "button"
              regenBtn.className =
                "text-[10px] uppercase font-mono tracking-wider text-brass bg-brass/10 hover:bg-brass/20 border border-brass/30 px-1.5 py-0.5 rounded shadow-xs cursor-pointer transition-colors"
              regenBtn.textContent = "↻"
              regenBtn.title = "Regenerate (Ctrl+Shift+G)"
              regenBtn.onmousedown = (e) => {
                e.preventDefault()
                e.stopPropagation()
                regenerateSuggestion(editor)
              }

              btnGroup.appendChild(acceptBtn)
              btnGroup.appendChild(rejectBtn)
              btnGroup.appendChild(regenBtn)
              return btnGroup
            }

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

                widgetEl.appendChild(textSpan)
                widgetEl.appendChild(createActionButtons())
              }

              decos.push(Decoration.widget(pluginState.from, widgetEl, { side: 1 }))
            } else if (pluginState.type === "rephrase") {
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

                widgetEl.appendChild(textSpan)
                widgetEl.appendChild(createActionButtons())
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

function getYjsDocFromEditor(editor: Editor): Y.Doc | null {
  const collabExt = editor.extensionManager.extensions.find((ext) => ext.name === "collaboration")
  return (collabExt?.options as { document?: Y.Doc })?.document || null
}

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

  const mainDoc = getYjsDocFromEditor(editor)
  const aiBranch = mainDoc ? createAIBranch(mainDoc) : undefined

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
        aiBranch,
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

  const mainDoc = getYjsDocFromEditor(editor)
  const aiBranch = mainDoc ? createAIBranch(mainDoc) : undefined

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
        aiBranch,
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
  const { type, suggestedText, from, to, aiBranch } = state
  if (!suggestedText) return

  const mainDoc = getYjsDocFromEditor(editor)
  if (aiBranch && mainDoc) {
    acceptBranch(mainDoc, aiBranch)
  }

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
  const state = inlineSuggestionPluginKey.getState(editor.state)
  if (state?.aiBranch) {
    rejectBranch(state.aiBranch)
  }

  editor.view.dispatch(
    editor.state.tr.setMeta(inlineSuggestionPluginKey, {
      type: "clear",
    })
  )
}

function regenerateSuggestion(editor: Editor): boolean {
  const state = inlineSuggestionPluginKey.getState(editor.state)
  if (!state?.active) return false

  const { type, from, to } = state
  rejectSuggestion(editor)

  if (type === "continue") {
    editor.commands.setTextSelection(from)
    return triggerContinuation(editor)
  } else if (type === "rephrase") {
    editor.commands.setTextSelection({ from, to })
    return triggerRephrase(editor)
  }

  return false
}
