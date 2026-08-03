import { hybridSearch } from "../search/hybrid-search"
import { llmClient } from "./llm-client"
import type { RAGChunk, SearchResult } from "@/types"

export interface RAGPipelineOptions {
  topK?: number
  minScoreThreshold?: number
  systemPrompt?: string
  signal?: AbortSignal
}

export async function* ragQuery(
  question: string,
  options: RAGPipelineOptions = {}
): AsyncGenerator<RAGChunk, void, unknown> {
  const trimmedQuestion = question.trim()
  if (!trimmedQuestion) {
    yield { type: "done", content: "" }
    return
  }

  // 1. Check if LLM is ready
  const llmStatus = llmClient.getStatus()
  if (llmStatus !== "ready") {
    yield {
      type: "error",
      content:
        "Please download and load an AI model first using the AI panel before asking questions.",
    }
    return
  }

  const topK = options.topK ?? 5
  const minScore = options.minScoreThreshold ?? 0.05

  // 2. Retrieve top-K relevant chunks via hybrid search
  let searchResults: SearchResult[] = []
  try {
    const rawResults = await hybridSearch(trimmedQuestion, { limit: topK })
    searchResults = rawResults.filter((r) => r.score >= minScore)
  } catch (err) {
    console.warn("Hybrid search retrieval failed in RAG pipeline:", err)
  }

  // 3. Handle zero results
  if (searchResults.length === 0) {
    yield {
      type: "done",
      content:
        "I couldn't find relevant information in your knowledge base to answer this question.",
    }
    return
  }

  // 4. Yield source metadata chunk for UI rendering
  yield {
    type: "source",
    content: `Retrieved ${searchResults.length} relevant document excerpt${searchResults.length === 1 ? "" : "s"}.`,
    sources: searchResults,
  }

  if (options.signal?.aborted) return

  // 5. Assemble context prompt
  const contextParts = searchResults.map((res, index) => {
    const header = res.heading
      ? `--- Source ${index + 1}: "${res.title}" > "${res.heading}" ---`
      : `--- Source ${index + 1}: "${res.title}" ---`
    return `${header}\n${res.chunkText}`
  })

  const systemInstruction =
    options.systemPrompt ||
    "You are Sovereign AI, an intelligent offline assistant. Use the following document excerpts from the user's personal knowledge base to answer the user's question accurately. Cite sources using [DocTitle§Heading] format when referencing facts. If the information is not contained in the excerpts, state that clearly."

  const prompt = `${systemInstruction}\n\n${contextParts.join("\n\n")}\n\nQuestion: ${trimmedQuestion}\nAnswer:`

  // 6. Stream answer generation via token callback bridge
  const tokenQueue: string[] = []
  let resolveQueue: (() => void) | null = null
  let isComplete = false
  let errorMsg: string | null = null

  const notifyQueue = () => {
    if (resolveQueue) {
      const resolve = resolveQueue
      resolveQueue = null
      resolve()
    }
  }

  const completionPromise = llmClient
    .chatCompletion([{ role: "user", content: prompt }], (tokenChunk) => {
      tokenQueue.push(tokenChunk)
      notifyQueue()
    })
    .then(() => {
      isComplete = true
      notifyQueue()
    })
    .catch((err) => {
      isComplete = true
      errorMsg = err instanceof Error ? err.message : String(err)
      notifyQueue()
    })

  let fullAnswer = ""

  while (!isComplete || tokenQueue.length > 0) {
    if (options.signal?.aborted) {
      break
    }

    if (tokenQueue.length > 0) {
      const chunk = tokenQueue.shift()!
      fullAnswer += chunk
      yield { type: "token", content: chunk }
    } else {
      await new Promise<void>((resolve) => {
        resolveQueue = resolve
      })
    }
  }

  await completionPromise

  if (errorMsg) {
    yield { type: "error", content: `LLM generation error: ${errorMsg}` }
    return
  }

  yield { type: "done", content: fullAnswer, sources: searchResults }
}
