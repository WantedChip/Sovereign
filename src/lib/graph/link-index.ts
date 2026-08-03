import type { JSONContent } from "@tiptap/react"
import { db } from "@/lib/db/schema"
import type { LinkEntry } from "@/types"

/**
 * Extracts raw wiki-link entries from Tiptap JSON content or Markdown/plain string content.
 */
export function extractLinks(
  sourceId: string,
  content: JSONContent | string | null | undefined
): LinkEntry[] {
  if (!content) return []

  const rawLinks: Array<{ targetTitle: string; targetId: string | null }> = []

  if (typeof content === "string") {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g
    let match: RegExpExecArray | null
    while ((match = wikiLinkRegex.exec(content)) !== null) {
      const title = match[1]?.trim()
      if (title) {
        rawLinks.push({ targetTitle: title, targetId: null })
      }
    }
  } else {
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return

      const jsonNode = node as {
        type?: string
        attrs?: Record<string, unknown>
        content?: unknown[]
      }

      if (
        jsonNode.type === "wikiLink" &&
        jsonNode.attrs &&
        typeof jsonNode.attrs.title === "string"
      ) {
        const title = jsonNode.attrs.title.trim()
        if (title) {
          const docId =
            typeof jsonNode.attrs.documentId === "string" ? jsonNode.attrs.documentId : null
          rawLinks.push({ targetTitle: title, targetId: docId })
        }
      }

      if (Array.isArray(jsonNode.content)) {
        for (const child of jsonNode.content) {
          walk(child)
        }
      }
    }

    walk(content)
  }

  // De-duplicate links by targetTitle per document
  const uniqueMap = new Map<string, LinkEntry>()
  for (const link of rawLinks) {
    const key = link.targetTitle.toLowerCase()
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        sourceId,
        targetTitle: link.targetTitle,
        targetId: link.targetId,
      })
    }
  }

  return Array.from(uniqueMap.values())
}

/**
 * Re-extracts links from a document's content, resolves target document IDs against Dexie DB,
 * and persists the updated forward link registry in Dexie.
 */
export async function updateDocumentLinks(
  sourceId: string,
  content: JSONContent | string | null | undefined
): Promise<LinkEntry[]> {
  const links = extractLinks(sourceId, content)

  // Fetch all current documents to resolve target titles to target IDs
  const allDocs = await db.documents.toArray()
  const titleToIdMap = new Map<string, string>()
  for (const doc of allDocs) {
    titleToIdMap.set(doc.title.toLowerCase().trim(), doc.id)
  }

  const resolvedLinks: LinkEntry[] = links.map((link) => {
    const resolvedId =
      link.targetId || titleToIdMap.get(link.targetTitle.toLowerCase().trim()) || null
    return {
      ...link,
      targetId: resolvedId,
    }
  })

  await db.transaction("rw", db.links, async () => {
    await db.links.where("sourceId").equals(sourceId).delete()
    if (resolvedLinks.length > 0) {
      await db.links.bulkAdd(resolvedLinks)
    }
  })

  return resolvedLinks
}

/**
 * Resolves unresolved wiki-links when a target document with the given title is created or renamed.
 */
export async function resolveLinksForDocument(documentId: string, title: string): Promise<void> {
  const normalizedTitle = title.toLowerCase().trim()
  if (!normalizedTitle) return

  const matchingLinks = await db.links
    .filter((link) => link.targetTitle.toLowerCase().trim() === normalizedTitle)
    .toArray()

  if (matchingLinks.length === 0) return

  await db.transaction("rw", db.links, async () => {
    for (const link of matchingLinks) {
      if (link.id !== undefined && link.targetId !== documentId) {
        await db.links.update(link.id, { targetId: documentId })
      }
    }
  })
}

/**
 * Returns all forward links originating FROM the given document.
 */
export async function getForwardLinks(documentId: string): Promise<LinkEntry[]> {
  return await db.links.where("sourceId").equals(documentId).toArray()
}

/**
 * Returns all backlinks pointing TO the given document (by documentId or target title).
 */
export async function getBacklinks(documentId: string, title?: string): Promise<LinkEntry[]> {
  let docTitle = title
  if (!docTitle) {
    const doc = await db.documents.get(documentId)
    docTitle = doc?.title
  }

  const normalizedTitle = docTitle?.toLowerCase().trim()

  return await db.links
    .filter(
      (link) =>
        link.targetId === documentId ||
        (Boolean(normalizedTitle) && link.targetTitle.toLowerCase().trim() === normalizedTitle)
    )
    .toArray()
}

/**
 * Returns all links in the entire knowledge graph.
 */
export async function getAllLinks(): Promise<LinkEntry[]> {
  return await db.links.toArray()
}

/**
 * Removes all links originating from a deleted document and nullifies references where it was the target.
 */
export async function removeDocumentLinks(documentId: string): Promise<void> {
  await db.transaction("rw", db.links, async () => {
    await db.links.where("sourceId").equals(documentId).delete()

    const targetLinks = await db.links.where("targetId").equals(documentId).toArray()
    for (const link of targetLinks) {
      if (link.id !== undefined) {
        await db.links.update(link.id, { targetId: null })
      }
    }
  })
}
