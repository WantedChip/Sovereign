import { zip } from "fflate"
import { db } from "@/lib/db/schema"
import { opfsClient } from "@/lib/storage/opfs-client"
import { turndownService } from "@/lib/editor/markdown"
import type { Document } from "@/types"

export interface ExportProgress {
  current: number
  total: number
  statusText: string
}

export type ExportProgressCallback = (progress: ExportProgress) => void

/**
 * Sanitizes a title string to create a clean URL/filename slug.
 */
export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "untitled-document"
}

/**
 * Formats frontmatter and markdown body into a single Markdown string.
 */
export function formatMarkdownWithFrontmatter(doc: Document, markdownBody: string): string {
  const frontmatterObj = {
    title: doc.title || "Untitled Document",
    id: doc.id,
    created: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updated: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    tags: doc.tags || [],
    wordCount: doc.wordCount || 0,
  }

  const yamlLines = [
    "---",
    `title: "${frontmatterObj.title.replace(/"/g, '\\"')}"`,
    `id: "${frontmatterObj.id}"`,
    `created: "${frontmatterObj.created}"`,
    `updated: "${frontmatterObj.updated}"`,
    `tags: [${frontmatterObj.tags.map((t) => `"${t}"`).join(", ")}]`,
    `wordCount: ${frontmatterObj.wordCount}`,
    "---",
    "",
    markdownBody,
  ]

  return yamlLines.join("\n")
}

/**
 * Exports the entire Sovereign knowledge base as a structured ZIP file Blob containing Markdown documents.
 */
export async function exportKnowledgeBase(onProgress?: ExportProgressCallback): Promise<Blob> {
  const documents = await db.documents.orderBy("updatedAt").reverse().toArray()
  const total = documents.length

  onProgress?.({
    current: 0,
    total,
    statusText: `Preparing export for ${total} document${total === 1 ? "" : "s"}...`,
  })

  const dateStr = new Date().toISOString().split("T")[0]
  const rootFolderName = `sovereign-export-${dateStr}`

  // Map of file paths inside the ZIP to Uint8Array content
  const zipFiles: Record<string, Uint8Array> = {}
  const encoder = new TextEncoder()

  const usedFilenames = new Map<string, number>()
  const docExportItems: Array<{
    id: string
    title: string
    filename: string
    relativePath: string
    updatedAt: number
    tags: string[]
  }> = []

  // 1. Process each document into Markdown
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    onProgress?.({
      current: i + 1,
      total,
      statusText: `Exporting document ${i + 1} of ${total}: "${doc.title}"...`,
    })

    // Read content from OPFS or fallback
    let rawContent = ""
    try {
      const stored = await opfsClient.readDocumentContent<string>(doc.id)
      if (typeof stored === "string") {
        rawContent = stored
      } else if (stored && typeof stored === "object") {
        rawContent = JSON.stringify(stored)
      }
    } catch {
      // OPFS file missing or unreadable
    }

    let markdownBody = ""
    if (rawContent) {
      if (rawContent.trim().startsWith("<") || rawContent.trim().startsWith("{")) {
        markdownBody = turndownService.turndown(rawContent)
      } else {
        markdownBody = rawContent
      }
    }

    // Generate unique slugified filename
    const baseSlug = slugifyTitle(doc.title)
    let filename = `${baseSlug}.md`
    const count = usedFilenames.get(baseSlug) || 0
    if (count > 0) {
      filename = `${baseSlug}-${count}.md`
    }
    usedFilenames.set(baseSlug, count + 1)

    const docPath = `${rootFolderName}/documents/${filename}`
    const fullMarkdown = formatMarkdownWithFrontmatter(doc, markdownBody)
    zipFiles[docPath] = encoder.encode(fullMarkdown)

    const updatedAtMs =
      doc.updatedAt instanceof Date ? doc.updatedAt.getTime() : new Date(doc.updatedAt).getTime()

    docExportItems.push({
      id: doc.id,
      title: doc.title,
      filename,
      relativePath: `documents/${filename}`,
      updatedAt: updatedAtMs,
      tags: doc.tags || [],
    })
  }


  // 2. Generate index.md (Table of Contents)
  const indexMarkdownLines = [
    `# Knowledge Base Index — ${dateStr}`,
    "",
    `Total Documents: **${docExportItems.length}**`,
    `Exported At: \`${new Date().toISOString()}\``,
    "",
    "## Document Registry",
    "",
  ]

  if (docExportItems.length === 0) {
    indexMarkdownLines.push("*No documents found in knowledge base.*")
  } else {
    docExportItems.forEach((item, index) => {
      const updatedDate = new Date(item.updatedAt).toLocaleDateString()
      const tagBadges = item.tags.length > 0 ? ` \`[${item.tags.join(", ")}]\`` : ""
      indexMarkdownLines.push(
        `${index + 1}. [${item.title}](${item.relativePath}) — *Last updated: ${updatedDate}*${tagBadges}`
      )
    })
  }

  zipFiles[`${rootFolderName}/index.md`] = encoder.encode(indexMarkdownLines.join("\n"))

  // 3. Generate metadata.json
  const metadataJSON = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: "0.9.0",
      totalDocuments: docExportItems.length,
      documents: docExportItems,
    },
    null,
    2
  )

  zipFiles[`${rootFolderName}/metadata.json`] = encoder.encode(metadataJSON)

  // 4. Compress files into ZIP Uint8Array
  onProgress?.({
    current: total,
    total,
    statusText: "Compressing ZIP archive...",
  })

  return new Promise<Blob>((resolve, reject) => {
    zip(zipFiles, { level: 6 }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/zip" })
        resolve(blob)
      }
    })
  })
}

/**
 * Triggers an immediate browser download for an exported ZIP blob.
 */
export function downloadExport(blob: Blob, customFilename?: string): void {
  const dateStr = new Date().toISOString().split("T")[0]
  const filename = customFilename || `sovereign-export-${dateStr}.zip`

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
