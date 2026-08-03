import { useState, useRef, useEffect, useCallback } from "react"
import { ragQuery, type RAGPipelineOptions } from "@/lib/ai/rag-pipeline"
import { llmClient, type LLMStatus } from "@/lib/ai/llm-client"
import type { SearchResult } from "@/types"

export interface UseAIReturn {
  askQuestion: (question: string, options?: RAGPipelineOptions) => Promise<void>
  isGenerating: boolean
  answer: string
  sources: SearchResult[]
  error: string | null
  stopGeneration: () => void
  reset: () => void
  llmStatus: LLMStatus
}

export function useAI(): UseAIReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [llmStatus, setLlmStatus] = useState<LLMStatus>(llmClient.getStatus())

  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const unsub = llmClient.subscribeStatus((newStatus) => {
      setLlmStatus(newStatus)
    })
    return () => unsub()
  }, [])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
  }, [])

  const reset = useCallback(() => {
    stopGeneration()
    setAnswer("")
    setSources([])
    setError(null)
  }, [stopGeneration])

  const askQuestion = useCallback(
    async (question: string, options: RAGPipelineOptions = {}) => {
      stopGeneration()

      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsGenerating(true)
      setAnswer("")
      setSources([])
      setError(null)

      try {
        const generator = ragQuery(question, {
          ...options,
          signal: controller.signal,
        })

        for await (const chunk of generator) {
          if (controller.signal.aborted) {
            break
          }

          if (chunk.type === "source" && chunk.sources) {
            setSources(chunk.sources)
          } else if (chunk.type === "token") {
            setAnswer((prev) => prev + chunk.content)
          } else if (chunk.type === "error") {
            setError(chunk.content)
          } else if (chunk.type === "done") {
            if (chunk.content && !answer) {
              setAnswer(chunk.content)
            }
            if (chunk.sources) {
              setSources(chunk.sources)
            }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const msg = err instanceof Error ? err.message : String(err)
          setError(msg)
        }
      } finally {
        if (abortControllerRef.current === controller) {
          setIsGenerating(false)
          abortControllerRef.current = null
        }
      }
    },
    [stopGeneration, answer]
  )

  return {
    askQuestion,
    isGenerating,
    answer,
    sources,
    error,
    stopGeneration,
    reset,
    llmStatus,
  }
}
