import { useEffect, useRef, useState } from "react"
import { hybridSearch } from "@/lib/search/hybrid-search"
import type { SearchResult } from "@/types"

export interface UseSearchReturn {
  query: string
  setQuery: (query: string) => void
  results: SearchResult[]
  isSearching: boolean
  error: Error | null
  clearSearch: () => void
}

export function useSearch(debounceMs = 200, limit = 20): UseSearchReturn {
  const [query, setQuery] = useState<string>("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      queueMicrotask(() => {
        setResults([])
        setIsSearching(false)
        setError(null)
      })
      return
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true)
      setError(null)
      try {
        const res = await hybridSearch(trimmed, { limit })
        setResults(res)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Search failed"))
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, debounceMs, limit])

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsSearching(false)
    setError(null)
  }

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
  }
}
