import { Node, mergeAttributes } from "@tiptap/core"

export interface CollapsibleOptions {
  HTMLAttributes: Record<string, unknown>
}

export const CollapsibleBlockNode = Node.create<CollapsibleOptions>({
  name: "collapsibleBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      title: {
        default: "Toggle Section",
      },
      isOpen: {
        default: true,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'details[data-type="collapsible-block"]',
        getAttrs: (element) => {
          if (typeof element === "string") return false
          const summary = element.querySelector("summary")
          return {
            title: summary?.textContent || "Toggle Section",
            isOpen: element.hasAttribute("open"),
          }
        },
      },
      {
        tag: "details",
        getAttrs: (element) => {
          if (typeof element === "string") return false
          const summary = element.querySelector("summary")
          return {
            title: summary?.textContent || "Toggle Section",
            isOpen: element.hasAttribute("open"),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = mergeAttributes(
      {
        "data-type": "collapsible-block",
        class:
          "collapsible-block my-3 rounded-sm border border-slate-line bg-secondary/30 text-parchment overflow-hidden transition-all duration-200",
      },
      HTMLAttributes
    )

    if (node.attrs.isOpen) {
      attrs.open = ""
    }

    return [
      "details",
      attrs,
      [
        "summary",
        {
          class:
            "flex items-center gap-2 p-2.5 font-serif font-semibold text-sm text-parchment bg-secondary/60 hover:bg-secondary cursor-pointer select-none border-b border-slate-line/50 transition-colors",
        },
        node.attrs.title,
      ],
      [
        "div",
        {
          class: "collapsible-content p-4 space-y-2",
        },
        0,
      ],
    ]
  },
})
