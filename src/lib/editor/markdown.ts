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

// Custom Rule for Wiki Links ([[Title]])
turndownService.addRule("wikiLink", {
  filter: (node) => {
    return (
      node.nodeName === "SPAN" && (node as HTMLElement).getAttribute("data-type") === "wiki-link"
    )
  },
  replacement: (_content, node) => {
    const title = (node as HTMLElement).getAttribute("data-title") || node.textContent || ""
    const cleanTitle = title.replace(/^\[\[|\]\]$/g, "").trim()
    return `[[${cleanTitle}]]`
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
 * Parses a Markdown string into HTML suitable for loading into Tiptap, converting [[Wiki Links]] to span nodes.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ""
  const processed = markdown.replace(/\[\[([^\]]+)\]\]/g, (_match, title) => {
    const cleanTitle = title.trim()
    return `<span data-type="wiki-link" data-title="${cleanTitle}">[[${cleanTitle}]]</span>`
  })
  return mdParser.render(processed)
}

/**
 * Loads a Markdown string into a Tiptap editor.
 */
export function loadMarkdownIntoEditor(editor: Editor | null, markdown: string): void {
  if (!editor) return
  const html = markdownToHtml(markdown)
  editor.commands.setContent(html)
}
