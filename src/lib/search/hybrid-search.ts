import { search } from "@orama/orama"
import { initSearchIndex, type SovereignOramaDB } from "./orama-index"
import { embeddingClient } from "../ai/embedding-client"
import type { SearchResult } from "@/types"

export interface HybridSearchOptions {
  limit?: number
  mode?: "hybrid" | "text" | "vector"
}

export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<SearchResult[]> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const limit = options.limit ?? 20
  const db = await initSearchIndex()

  if (trimmedQuery.length < 3 || options.mode === "text") {
    return runTextSearch(db, trimmedQuery, limit)
  }

  let queryVector: number[] | null = null
  try {
    const floatVec = await embeddingClient.embedText(trimmedQuery)
    if (floatVec && floatVec.length === 384) {
      queryVector = Array.from(floatVec)
    }
  } catch (err) {
    console.warn("Failed to embed search query, falling back to BM25 text search:", err)
  }

  if (!queryVector) {
    return runTextSearch(db, trimmedQuery, limit)
  }

  try {
    const results = await search(db, {
      term: trimmedQuery,
      mode: "hybrid",
      vector: {
        value: queryVector,
        property: "embedding",
      },
      limit,
    })

    if (!results || !results.hits || results.hits.length === 0) {
      return []
    }

    return results.hits.map((hit) => {
      const doc = hit.document
      return {
        id: doc.id,
        documentId: doc.documentId,
        title: doc.title,
        chunkText: doc.text,
        heading: doc.heading,
        score: hit.score ?? 0,
        chunkIndex: doc.chunkIndex,
        updatedAt: doc.updatedAt,
      }
    })
  } catch (err) {
    console.warn("Orama hybrid search failed, falling back to text search:", err)
    return runTextSearch(db, trimmedQuery, limit)
  }
}

async function runTextSearch(
  db: SovereignOramaDB,
  query: string,
  limit: number
): Promise<SearchResult[]> {
  try {
    const results = await search(db, {
      term: query,
      limit,
    })

    if (!results || !results.hits) return []

    return results.hits.map((hit) => {
      const doc = hit.document
      return {
        id: doc.id,
        documentId: doc.documentId,
        title: doc.title,
        chunkText: doc.text,
        heading: doc.heading,
        score: hit.score ?? 0,
        chunkIndex: doc.chunkIndex,
        updatedAt: doc.updatedAt,
      }
    })
  } catch (err) {
    console.error("Orama text search failed:", err)
    return []
  }
}
