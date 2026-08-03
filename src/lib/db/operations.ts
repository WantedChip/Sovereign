import type { JSONContent } from "@tiptap/react"
import { db } from "./schema"
import { opfsClient } from "@/lib/storage/opfs-client"
import { errorHandler } from "@/lib/error-handler"
import {
  updateDocumentLinks,
  resolveLinksForDocument,
  removeDocumentLinks,
} from "@/lib/graph/link-index"
import { indexDocument, removeDocument } from "@/lib/search/orama-index"
import type { Document, DocumentMeta } from "@/types"

export function extractTextFromJSON(node: unknown): string {
  if (!node || typeof node !== "object") return ""

  const jsonNode = node as { text?: string; content?: unknown[] }
  let text = jsonNode.text ?? ""

  if (Array.isArray(jsonNode.content)) {
    for (const child of jsonNode.content) {
      text += " " + extractTextFromJSON(child)
    }
  }

  return text
}

export function calculateWordCount(content: unknown): number {
  if (!content) return 0
  const plainText = typeof content === "string" ? content : extractTextFromJSON(content)
  const words = plainText.trim().split(/\s+/)
  return words.filter((w) => w.length > 0).length
}

export async function createDocument(
  title?: string,
  content?: JSONContent | string
): Promise<Document> {
  const id = crypto.randomUUID()
  const now = new Date()
  const docTitle = title?.trim() || "Untitled Document"
  const docContent = content ?? {
    type: "doc",
    content: [{ type: "paragraph" }],
  }
  const wordCount = calculateWordCount(docContent)

  const docRecord: Document = {
    id,
    title: docTitle,
    content: "", // Stored in OPFS
    createdAt: now,
    updatedAt: now,
    tags: [],
    wordCount,
  }

  try {
    await db.documents.put(docRecord)
    await opfsClient.writeDocumentContent(id, docContent)
  } catch (err) {
    errorHandler.handleStorageError(err)
    throw err
  }

  await updateDocumentLinks(id, docContent)
  await resolveLinksForDocument(id, docTitle)
  void indexDocument(id, docTitle, docContent, now.getTime())

  return {
    ...docRecord,
    content: docContent,
  }
}

export async function createFromLink(targetTitle: string): Promise<Document> {
  const title = targetTitle.trim() || "Untitled Note"
  return await createDocument(title)
}

export async function getDocument(id: string): Promise<Document | null> {
  const meta = await db.documents.get(id)
  if (!meta) return null

  const opfsContent = await opfsClient.readDocumentContent(id)
  return {
    ...meta,
    content: opfsContent ?? meta.content ?? { type: "doc", content: [{ type: "paragraph" }] },
  }
}

export async function updateDocument(
  id: string,
  updates: Partial<Omit<Document, "id">>
): Promise<Document | null> {
  const existing = await db.documents.get(id)
  if (!existing) return null

  const now = new Date()
  const updatedMeta: Partial<Document> = {
    updatedAt: now,
  }

  if (updates.title !== undefined) updatedMeta.title = updates.title
  if (updates.tags !== undefined) updatedMeta.tags = updates.tags

  if (updates.content !== undefined) {
    updatedMeta.wordCount = calculateWordCount(updates.content)
    await opfsClient.writeDocumentContent(id, updates.content)
    await updateDocumentLinks(id, updates.content)
  } else if (updates.wordCount !== undefined) {
    updatedMeta.wordCount = updates.wordCount
  }

  if (updates.title !== undefined) {
    await resolveLinksForDocument(id, updates.title)
  }

  await db.documents.update(id, updatedMeta)

  const finalDoc = await getDocument(id)
  if (finalDoc && (updates.content !== undefined || updates.title !== undefined)) {
    void indexDocument(id, finalDoc.title, finalDoc.content, finalDoc.updatedAt.getTime())
  }

  return finalDoc
}

export async function deleteDocument(id: string): Promise<void> {
  await db.documents.delete(id)
  await opfsClient.deleteDocumentContent(id)
  await removeDocumentLinks(id)
  void removeDocument(id)
}

export async function listDocuments(): Promise<DocumentMeta[]> {
  const docs = await db.documents.orderBy("updatedAt").reverse().toArray()
  return docs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    updatedAt: doc.updatedAt,
    wordCount: doc.wordCount,
    tags: doc.tags,
  }))
}

export async function searchDocuments(query: string): Promise<DocumentMeta[]> {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return listDocuments()

  const allDocs = await listDocuments()
  return allDocs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}
