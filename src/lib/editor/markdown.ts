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

// Custom Rule for Callout Blocks (div[data-type="callout"])
turndownService.addRule("calloutBlock", {
  filter: (node) => {
    return node.nodeName === "DIV" && (node as HTMLElement).getAttribute("data-type") === "callout"
  },
  replacement: (content, node) => {
    const type = (node as HTMLElement).getAttribute("data-callout-type") || "info"
    const prefixMap: Record<string, string> = {
      info: "[!NOTE]",
      warning: "[!WARNING]",
      tip: "[!TIP]",
      danger: "[!CAUTION]",
    }
    const alertTag = prefixMap[type] || "[!NOTE]"
    const cleanContent = content.trim().replace(/\n/g, "\n> ")
    return `\n> ${alertTag}\n> ${cleanContent}\n\n`
  },
})

// Custom Rule for Collapsible Blocks (details[data-type="collapsible-block"])
turndownService.addRule("collapsibleBlock", {
  filter: (node) => {
    return (
      node.nodeName === "DETAILS" &&
      (node as HTMLElement).getAttribute("data-type") === "collapsible-block"
    )
  },
  replacement: (_content, node) => {
    const el = node as HTMLElement
    const summary = el.querySelector("summary")?.textContent || "Toggle Section"
    const content = el.querySelector(".collapsible-content")?.innerHTML || ""
    const innerMd = turndownService.turndown(content)
    return `\n<details data-type="collapsible-block"><summary>${summary}</summary>\n\n${innerMd}\n\n</details>\n\n`
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
 * Parses a Markdown string into HTML suitable for loading into Tiptap, converting [[Wiki Links]] and callouts to HTML nodes.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ""
  let processed = markdown.replace(/\[\[([^\]]+)\]\]/g, (_match, title) => {
    const cleanTitle = title.trim()
    return `<span data-type="wiki-link" data-title="${cleanTitle}">[[${cleanTitle}]]</span>`
  })

  // Convert GFM alerts (> [!NOTE], etc.) to callout divs
  processed = processed.replace(
    />\s*\[!(NOTE|INFO|WARNING|TIP|CAUTION|DANGER)\]\n((?:>[^\n]*\n?)*)/gi,
    (_match, tag, body) => {
      const typeMap: Record<string, string> = {
        NOTE: "info",
        INFO: "info",
        WARNING: "warning",
        TIP: "tip",
        CAUTION: "danger",
        DANGER: "danger",
      }
      const calloutType = typeMap[tag.toUpperCase()] || "info"
      const cleanBody = body.replace(/^>\s?/gm, "").trim()
      return `<div data-type="callout" data-callout-type="${calloutType}"><p>${cleanBody}</p></div>`
    }
  )

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
