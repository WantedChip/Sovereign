import { Extension, type Editor, type Range } from "@tiptap/core"
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion"
import { ReactRenderer } from "@tiptap/react"
import tippy, { type Instance as TippyInstance, type GetReferenceClientRect } from "tippy.js"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  Minus,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  AlertOctagon,
} from "lucide-react"
import { SlashMenu, type SlashMenuRef, type SlashCommandItem } from "./SlashMenu"

export const defaultSlashCommands: SlashCommandItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bulleted list",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: "Numbered List",
    description: "Create an ordered numbered list",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: "Collapsible Section",
    description: "Create a toggleable section with summary header",
    icon: ChevronDown,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "collapsibleBlock",
          attrs: { title: "Toggle Section", isOpen: true },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Collapsible content block..." }],
            },
          ],
        })
        .run()
    },
  },
  {
    title: "Info Callout",
    description: "Highlight information with a brass callout box",
    icon: Info,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "calloutBlock",
          attrs: { type: "info" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Important note or reference info." }],
            },
          ],
        })
        .run()
    },
  },
  {
    title: "Warning Callout",
    description: "Highlight cautions or warnings",
    icon: AlertTriangle,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "calloutBlock",
          attrs: { type: "warning" },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Warning: Verify hardware settings before proceeding." },
              ],
            },
          ],
        })
        .run()
    },
  },
  {
    title: "Tip Callout",
    description: "Highlight helpful tips or best practices",
    icon: Lightbulb,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "calloutBlock",
          attrs: { type: "tip" },
          content: [
            {
              type: "paragraph",
              content: [
                { type: "text", text: "Tip: Use keyboard shortcuts for rapid field entry." },
              ],
            },
          ],
        })
        .run()
    },
  },
  {
    title: "Danger Callout",
    description: "Highlight critical errors or dangerous actions",
    icon: AlertOctagon,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "calloutBlock",
          attrs: { type: "danger" },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Danger: Unsaved local data will be permanently overwritten.",
                },
              ],
            },
          ],
        })
        .run()
    },
  },
  {
    title: "Blockquote",
    description: "Capture a quote or citation",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: "Code Block",
    description: "Add a syntax-highlighted code block",
    icon: SquareCode,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: "Divider",
    description: "Separate blocks with a horizontal line",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
]

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor
          range: Range
          props: SlashCommandItem
        }) => {
          props.command({ editor, range })
        },
      } as Partial<SuggestionOptions>,
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          return defaultSlashCommands.filter(
            (item) =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: ReactRenderer<SlashMenuRef> | null = null
          let popup: TippyInstance[] | null = null

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, {
                props,
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
              component?.updateProps(props)

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
