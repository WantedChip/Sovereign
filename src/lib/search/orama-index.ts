import { create, insert, remove, search, save, load, type Orama, type RawData } from "@orama/orama"
import type { JSONContent } from "@tiptap/core"
import { chunkDocument } from "../ai/chunker"
import { embeddingClient } from "../ai/embedding-client"
import { db } from "../db/schema"
import { listDocuments, getDocument } from "../db/operations"

export const searchSchema = {
  id: "string",
  documentId: "string",
  chunkIndex: "number",
  title: "string",
  text: "string",
  heading: "string",
  embedding: "vector[384]",
  updatedAt: "number",
} as const

export type SovereignOramaDB = Orama<typeof searchSchema>

let oramaInstance: SovereignOramaDB | null = null
let initPromise: Promise<SovereignOramaDB> | null = null

export async function createSearchIndex(): Promise<SovereignOramaDB> {
  return await create({
    schema: searchSchema,
  })
}

export async function initSearchIndex(): Promise<SovereignOramaDB> {
  if (oramaInstance) return oramaInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const savedSetting = await db.settings.get("orama_vector_index")
      if (savedSetting && savedSetting.value) {
        try {
          const restored = await createSearchIndex()
          await load(restored, savedSetting.value as RawData)
          oramaInstance = restored
          return restored
        } catch (restoreErr) {
          console.warn(
            "Failed to restore Orama index from storage, creating fresh index:",
            restoreErr
          )
        }
      }
    } catch (dbErr) {
      console.warn("Failed to query IndexedDB for Orama index:", dbErr)
    }

    const fresh = await createSearchIndex()
    oramaInstance = fresh
    return fresh
  })().finally(() => {
    initPromise = null
  })

  return initPromise
}

export async function saveIndexToStorage(): Promise<void> {
  if (!oramaInstance) return
  try {
    const indexData = await save(oramaInstance)
    await db.settings.put({
      key: "orama_vector_index",
      value: indexData,
    })
  } catch (err) {
    console.error("Failed to save Orama index to IndexedDB:", err)
  }
}

export async function removeDocument(documentId: string): Promise<void> {
  const dbInstance = await initSearchIndex()

  const results = await search(dbInstance, {
    term: documentId,
    properties: ["documentId"],
    exact: true,
    limit: 1000,
  })

  if (results && results.hits && results.hits.length > 0) {
    for (const hit of results.hits) {
      await remove(dbInstance, hit.id)
    }
  }

  await saveIndexToStorage()
}

export async function indexDocument(
  documentId: string,
  title: string,
  content: JSONContent | string | null | undefined,
  updatedAt: number = Date.now()
): Promise<void> {
  if (!content) return

  const dbInstance = await initSearchIndex()

  // First, remove existing chunks for this documentId
  const results = await search(dbInstance, {
    term: documentId,
    properties: ["documentId"],
    exact: true,
    limit: 1000,
  })

  if (results && results.hits && results.hits.length > 0) {
    for (const hit of results.hits) {
      await remove(dbInstance, hit.id)
    }
  }

  // Chunk content
  const chunks = chunkDocument(content, documentId)
  if (chunks.length === 0) return

  // Generate embeddings via Web Worker embedding client
  const texts = chunks.map((c) => c.text)
  let embeddings: Float32Array[] = []
  try {
    embeddings = await embeddingClient.embedChunks(texts)
  } catch (err) {
    console.warn(
      `Failed to generate embeddings for doc ${documentId}, indexing with zero vectors:`,
      err
    )
  }

  // Insert chunks into Orama
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const floatVec = embeddings[i]
    const vectorArray = floatVec ? Array.from(floatVec) : new Array(384).fill(0)

    await insert(dbInstance, {
      id: chunk.id,
      documentId,
      chunkIndex: chunk.chunkIndex,
      title,
      text: chunk.text,
      heading: chunk.path,
      embedding: vectorArray,
      updatedAt,
    })
  }

  await saveIndexToStorage()
}

export async function reindexAll(): Promise<void> {
  const dbInstance = await createSearchIndex()
  oramaInstance = dbInstance

  const docs = await listDocuments()
  for (const docMeta of docs) {
    const fullDoc = await getDocument(docMeta.id)
    if (fullDoc && fullDoc.content) {
      const timeNum =
        typeof fullDoc.updatedAt === "number"
          ? fullDoc.updatedAt
          : fullDoc.updatedAt instanceof Date
            ? fullDoc.updatedAt.getTime()
            : Date.now()
      await indexDocument(fullDoc.id, fullDoc.title, fullDoc.content, timeNum)
    }
  }

  await saveIndexToStorage()
}

export function getSearchIndexSync(): SovereignOramaDB | null {
  return oramaInstance
}
