import { unzipSync } from "fflate"
import { db } from "@/lib/db/schema"
import { createDocument, updateDocument, deleteDocument } from "@/lib/db/operations"
import { markdownToHtml } from "@/lib/editor/markdown"
import { resolveLinksForDocument } from "@/lib/graph/link-index"
import { indexDocument } from "@/lib/search/orama-index"

export type ConflictMode = "rename" | "overwrite" | "skip"

export interface ImportResult {
  imported: number
  skipped: number
  overwritten: number
  errors: string[]
  importedDocIds: string[]
}

export interface ParsedFrontmatter {
  title?: string
  id?: string
  created?: string
  updated?: string
  tags?: string[]
  markdownBody: string
}

/**
 * Parses YAML frontmatter headers delimited by `---` lines.
 */
export function parseYAMLFrontmatter(rawContent: string): ParsedFrontmatter {
  const normalized = rawContent.replace(/\r\n/g, "\n")
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    return { markdownBody: rawContent }
  }

  const yamlText = match[1]
  const markdownBody = match[2]

  const result: ParsedFrontmatter = { markdownBody }

  yamlText.split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) return

    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()

    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key === "title") {
      result.title = value
    } else if (key === "id") {
      result.id = value
    } else if (key === "created") {
      result.created = value
    } else if (key === "updated") {
      result.updated = value
    } else if (key === "tags") {
      if (value.startsWith("[") && value.endsWith("]")) {
        const rawTags = value.slice(1, -1)
        result.tags = rawTags
          .split(",")
          .map((t) => t.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
      }
    }
  })

  return result
}

/**
 * Imports a ZIP file containing Markdown files into the Sovereign knowledge base.
 */
export async function importKnowledgeBase(
  file: File,
  options: { conflictMode: ConflictMode } = { conflictMode: "rename" },
  onProgress?: (current: number, total: number, status: string) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    overwritten: 0,
    errors: [],
    importedDocIds: [],
  }

  const arrayBuffer = await file.arrayBuffer()
  let unzipped: Record<string, Uint8Array>

  try {
    unzipped = unzipSync(new Uint8Array(arrayBuffer))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to extract ZIP file: ${msg}`, { cause: err })
  }

  const decoder = new TextDecoder("utf-8")
  const fileEntries = Object.keys(unzipped)

  // Filter markdown files (skip index.md if it's the TOC file, unless it's the only md file)
  const mdFilePaths = fileEntries.filter((path) => {
    if (!path.endsWith(".md") || path.startsWith("__MACOSX/") || path.includes("/.")) {
      return false
    }
    const filename = path.split("/").pop() || ""
    if (filename.toLowerCase() === "index.md" && fileEntries.length > 2) {
      return false
    }
    return true
  })

  const total = mdFilePaths.length
  if (total === 0) {
    result.errors.push("No Markdown (.md) files were found in the uploaded ZIP archive.")
    return result
  }

  // Pre-load existing documents for title conflict checking
  const existingDocs = await db.documents.toArray()
  const existingTitleMap = new Map<string, string>() // lowerTitle -> id
  existingDocs.forEach((doc) => existingTitleMap.set(doc.title.toLowerCase().trim(), doc.id))

  for (let i = 0; i < mdFilePaths.length; i++) {
    const filePath = mdFilePaths[i]
    const filename = filePath.split("/").pop() || "document.md"
    const rawText = decoder.decode(unzipped[filePath])

    onProgress?.(i + 1, total, `Parsing ${filename}...`)

    try {
      const parsed = parseYAMLFrontmatter(rawText)

      // Fallback title determination: frontmatter title -> first H1 -> filename
      let title = parsed.title?.trim()
      if (!title) {
        const h1Match = parsed.markdownBody.match(/^#\s+(.+)$/m)
        if (h1Match) {
          title = h1Match[1].trim()
        } else {
          title = filename.replace(/\.md$/i, "").replace(/-/g, " ").trim()
        }
      }

      if (!title) {
        title = "Imported Document"
      }

      const htmlContent = markdownToHtml(parsed.markdownBody)
      const lowerTitle = title.toLowerCase()
      const existingId = existingTitleMap.get(lowerTitle)

      let docId: string | null = null

      if (existingId) {
        if (options.conflictMode === "skip") {
          result.skipped++
          continue
        } else if (options.conflictMode === "overwrite") {
          const updatedDoc = await updateDocument(existingId, {
            title,
            content: htmlContent,
            tags: parsed.tags || [],
          })

          if (updatedDoc) {
            docId = updatedDoc.id
            result.overwritten++
          }
        } else {
          // 'rename' mode
          const newTitle = `${title} (Imported)`
          const newDoc = await createDocument(newTitle, htmlContent)
          docId = newDoc.id

          if (parsed.tags || parsed.created || parsed.updated) {
            await db.documents.update(newDoc.id, {
              tags: parsed.tags || [],
              createdAt: parsed.created ? new Date(parsed.created) : new Date(),
              updatedAt: parsed.updated ? new Date(parsed.updated) : new Date(),
            })
          }
          result.imported++
        }
      } else {
        const newDoc = await createDocument(title, htmlContent)
        docId = newDoc.id

        if (parsed.tags || parsed.created || parsed.updated) {
          await db.documents.update(newDoc.id, {
            tags: parsed.tags || [],
            createdAt: parsed.created ? new Date(parsed.created) : new Date(),
            updatedAt: parsed.updated ? new Date(parsed.updated) : new Date(),
          })
        }

        existingTitleMap.set(lowerTitle, newDoc.id)
        result.imported++
      }

      if (docId) {
        result.importedDocIds.push(docId)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      result.errors.push(`Error importing "${filename}": ${msg}`)
    }
  }

  // Resolve wiki links across all imported documents
  onProgress?.(total, total, "Resolving bidirectional wiki-links and updating search index...")

  for (const docId of result.importedDocIds) {
    const docMeta = await db.documents.get(docId)
    if (docMeta) {
      await resolveLinksForDocument(docId, docMeta.title)
      void indexDocument(docId, docMeta.title, docMeta.content, docMeta.updatedAt.getTime())
    }
  }

  return result
}

/**
 * Undoes an import batch by deleting all document IDs created during the import.
 */
export async function undoImport(importedDocIds: string[]): Promise<void> {
  for (const id of importedDocIds) {
    try {
      await deleteDocument(id)
    } catch (err) {
      console.warn(`Failed to delete document ${id} during import undo:`, err)
    }
  }
}
