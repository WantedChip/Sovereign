import type { JSONContent } from "@tiptap/core"

export interface DocumentChunk {
  id: string
  docId: string
  text: string
  path: string
  chunkIndex: number
  wordCount: number
}

function extractTextFromNode(node: JSONContent): string {
  if (node.text) {
    return node.text
  }
  if (!node.content || !Array.isArray(node.content)) {
    return ""
  }
  return node.content.map(extractTextFromNode).join("")
}

export function chunkDocument(
  content: JSONContent | string | null | undefined,
  docId: string = "doc"
): DocumentChunk[] {
  if (!content) return []

  if (typeof content === "string") {
    return chunkTextString(content, docId)
  }

  const chunks: DocumentChunk[] = []
  const headingStack: { level: number; text: string }[] = []
  let currentAccumulator = ""
  let currentPath = ""
  let chunkIndex = 0

  function flushAccumulator() {
    const trimmed = currentAccumulator.trim()
    if (!trimmed) return
    const words = trimmed.split(/\s+/).filter(Boolean)
    if (words.length === 0) return

    chunks.push({
      id: `${docId}-chunk-${chunkIndex}`,
      docId,
      text: trimmed,
      path: currentPath || "Document Body",
      chunkIndex,
      wordCount: words.length,
    })
    chunkIndex++
    currentAccumulator = ""
  }

  function traverse(node: JSONContent) {
    if (!node) return

    if (node.type === "heading") {
      const level = (node.attrs?.level as number) || 1
      const headingText = extractTextFromNode(node).trim()

      flushAccumulator()

      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop()
      }
      if (headingText) {
        headingStack.push({ level, text: headingText })
      }
      currentPath = headingStack.map((h) => h.text).join(" > ")
      return
    }

    if (
      node.type === "paragraph" ||
      node.type === "codeBlock" ||
      node.type === "blockquote" ||
      node.type === "calloutBlock"
    ) {
      const blockText = extractTextFromNode(node).trim()
      if (!blockText) return

      const accumulatedWords = currentAccumulator.split(/\s+/).filter(Boolean).length
      const blockWords = blockText.split(/\s+/).filter(Boolean).length

      if (accumulatedWords + blockWords > 300 && accumulatedWords > 0) {
        flushAccumulator()
      }

      if (currentAccumulator) {
        currentAccumulator += "\n\n" + blockText
      } else {
        currentAccumulator = blockText
      }

      if (currentAccumulator.split(/\s+/).filter(Boolean).length >= 300) {
        flushAccumulator()
      }
      return
    }

    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        traverse(child)
      }
    }
  }

  traverse(content)
  flushAccumulator()

  return chunks
}

function chunkTextString(text: string, docId: string): DocumentChunk[] {
  const lines = text.split(/\r?\n/)
  const chunks: DocumentChunk[] = []
  const headingStack: { level: number; text: string }[] = []
  let currentAccumulator = ""
  let currentPath = ""
  let chunkIndex = 0

  function flush() {
    const trimmed = currentAccumulator.trim()
    if (!trimmed) return
    const words = trimmed.split(/\s+/).filter(Boolean)
    if (words.length === 0) return

    chunks.push({
      id: `${docId}-chunk-${chunkIndex}`,
      docId,
      text: trimmed,
      path: currentPath || "Document Body",
      chunkIndex,
      wordCount: words.length,
    })
    chunkIndex++
    currentAccumulator = ""
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flush()
      const level = headingMatch[1].length
      const hText = headingMatch[2].trim()
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop()
      }
      headingStack.push({ level, text: hText })
      currentPath = headingStack.map((h) => h.text).join(" > ")
      continue
    }

    if (line.trim() === "") {
      if (currentAccumulator.split(/\s+/).filter(Boolean).length >= 200) {
        flush()
      }
      continue
    }

    if (currentAccumulator) {
      currentAccumulator += "\n" + line
    } else {
      currentAccumulator = line
    }

    if (currentAccumulator.split(/\s+/).filter(Boolean).length >= 300) {
      flush()
    }
  }

  flush()
  return chunks
}
