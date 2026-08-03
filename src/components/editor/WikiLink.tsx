import { Node, mergeAttributes, InputRule, type Editor, type Range } from "@tiptap/core"
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion"
import { PluginKey } from "@tiptap/pm/state"
import { ReactRenderer } from "@tiptap/react"
import tippy, { type Instance as TippyInstance, type GetReferenceClientRect } from "tippy.js"
import { listDocuments } from "@/lib/db/operations"
import { WikiLinkMenu, type WikiLinkMenuRef, type WikiLinkItem } from "./WikiLinkMenu"

export const mockDocuments: WikiLinkItem[] = [
  { title: "Welcome to Sovereign", id: "doc-welcome" },
  { title: "Field Survey Specification", id: "doc-field-spec" },
  { title: "Local AI & WebGPU Roadmap", id: "doc-ai-roadmap" },
  { title: "Bi-Directional Knowledge Graph", id: "doc-knowledge-graph" },
  { title: "OPFS Storage Architecture", id: "doc-opfs-storage" },
  { title: "CRDT P2P Sync Protocol", id: "doc-crdt-sync" },
]

export interface WikiLinkOptions {
  suggestion: Partial<SuggestionOptions>
}

export const WikiLinkNode = Node.create<WikiLinkOptions>({
  name: "wikiLink",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      title: {
        default: "",
      },
      documentId: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="wiki-link"]',
        getAttrs: (element) => {
          if (typeof element === "string") return false
          const title =
            element.getAttribute("data-title") ||
            element.textContent?.replace(/^\[\[|\]\]$/g, "").trim() ||
            ""
          const documentId = element.getAttribute("data-document-id")
          return { title, documentId }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "span",
      mergeAttributes(
        {
          "data-type": "wiki-link",
          "data-title": node.attrs.title,
          "data-document-id": node.attrs.documentId,
          class:
            "wiki-link font-mono inline-flex items-center gap-1 text-xs bg-brass/15 text-brass border border-brass/40 hover:bg-brass/30 px-1.5 py-0.5 rounded-sm select-none transition-colors cursor-pointer font-semibold",
          onClick: `console.log('[WikiLink] Navigate target clicked:', '${node.attrs.title}', '${node.attrs.documentId || "unresolved"}')`,
        },
        HTMLAttributes
      ),
      `[[${node.attrs.title}]]`,
    ]
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\[\[([^\]]+)\]\]$/,
        handler: ({ state, range, match }) => {
          const title = match[1]?.trim()
          if (!title) return null
          const { tr } = state
          tr.replaceWith(
            range.from,
            range.to,
            this.type.create({
              title,
              documentId: null,
            })
          )
        },
      }),
    ]
  },

  addOptions() {
    return {
      suggestion: {
        char: "[[",
        pluginKey: new PluginKey("wikiLink"),
        allowSpaces: true,
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: WikiLinkItem
        }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent([
              {
                type: this.name,
                attrs: {
                  title: props.title,
                  documentId: props.id || null,
                },
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run()
        },
      } as Partial<SuggestionOptions>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey("wikiLink"),
        ...this.options.suggestion,
        items: async ({ query }: { query: string }) => {
          const dbDocs = await listDocuments().catch(() => [])
          const dbItems: WikiLinkItem[] = dbDocs.map((doc) => ({
            title: doc.title,
            id: doc.id,
          }))

          const existingTitles = new Set(dbItems.map((i) => i.title.toLowerCase()))
          const fallbacks = mockDocuments.filter(
            (item) => !existingTitles.has(item.title.toLowerCase())
          )

          const allItems = [...dbItems, ...fallbacks]
          const lowerQuery = query.toLowerCase()
          return allItems.filter((doc) => doc.title.toLowerCase().includes(lowerQuery))
        },

        render: () => {
          let component: ReactRenderer<WikiLinkMenuRef> | null = null
          let popup: TippyInstance[] | null = null

          return {
            onStart: (props) => {
              component = new ReactRenderer(WikiLinkMenu, {
                props: {
                  items: props.items as WikiLinkItem[],
                  query: props.query,
                  command: (item: WikiLinkItem) => props.command(item),
                },
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as GetReferenceClientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })
            },

            onUpdate: (props) => {
              component?.updateProps({
                items: props.items as WikiLinkItem[],
                query: props.query,
                command: (item: WikiLinkItem) => props.command(item),
              })

              if (!props.clientRect) {
                return
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as GetReferenceClientRect,
              })
            },

            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide()
                return true
              }

              return component?.ref?.onKeyDown(props) ?? false
            },

            onExit: () => {
              popup?.[0]?.destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})
