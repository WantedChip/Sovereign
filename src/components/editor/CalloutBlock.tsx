import { Node, mergeAttributes } from "@tiptap/core"

export type CalloutType = "info" | "warning" | "tip" | "danger"

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>
}

export const CalloutBlockNode = Node.create<CalloutOptions>({
  name: "calloutBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info" as CalloutType,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
        getAttrs: (element) => {
          if (typeof element === "string") return false
          const type = element.getAttribute("data-callout-type") || "info"
          return { type }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = (node.attrs.type || "info") as CalloutType
    return [
      "div",
      mergeAttributes(
        {
          "data-type": "callout",
          "data-callout-type": type,
          class: `callout callout-${type} my-3 p-4 rounded-sm border space-y-2`,
        },
        HTMLAttributes
      ),
      0,
    ]
  },
})
