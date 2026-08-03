import { type Editor } from "@tiptap/react"
import TurndownService from "turndown"
import markdownit from "markdown-it"

// Initialize Turndown instance with GFM options
export const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
  strongDelimiter: "**",
})

// Custom Rule for Strikethrough (~~del~~)
turndownService.addRule("strikethrough", {
  filter: (node) => ["DEL", "S", "STRIKE"].includes(node.nodeName),
  replacement: (content) => `~~${content}~~`,
})

// Custom Rule for Fenced Code Blocks with Language preservation
turndownService.addRule("fencedCodeBlock", {
  filter: (node) => {
    return node.nodeName === "PRE" && node.firstChild?.nodeName === "CODE"
  },
  replacement: (_content, node) => {
    const codeNode = (node as HTMLElement).querySelector("code")
    const className = codeNode?.getAttribute("class") || ""
    const languageMatch = className.match(/language-(\w+)/)
    const language = languageMatch ? languageMatch[1] : ""
    const codeText = codeNode?.textContent || ""
    return `\n\`\`\`${language}\n${codeText}\n\`\`\`\n`
  },
})

// Initialize markdown-it parser
export const mdParser = markdownit({
  html: true,
  linkify: true,
  typographer: true,
})

/**
 * Serializes the current Tiptap editor content into a clean Markdown string.
 */
export function toMarkdown(editor: Editor | null): string {
  if (!editor) return ""
  const html = editor.getHTML()
  return turndownService.turndown(html)
}

/**
 * Parses a Markdown string into HTML suitable for loading into Tiptap.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ""
  return mdParser.render(markdown)
}

/**
 * Loads a Markdown string into a Tiptap editor.
 */
export function loadMarkdownIntoEditor(editor: Editor | null, markdown: string): void {
  if (!editor) return
  const html = markdownToHtml(markdown)
  editor.commands.setContent(html)
}
