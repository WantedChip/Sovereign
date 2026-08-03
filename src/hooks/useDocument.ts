import { useCallback, useEffect, useRef, useState } from "react"
import type { JSONContent } from "@tiptap/react"
import { getDocument, updateDocument } from "@/lib/db/operations"
import type { Document } from "@/types"

export interface UseDocumentReturn {
  document: Document | null
  isLoading: boolean
  isSaving: boolean
  error: Error | null
  saveContent: (content: JSONContent | string) => void
  updateTitle: (title: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useDocument(id: string | null, debounceMs = 500): UseDocumentReturn {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingContentRef = useRef<JSONContent | string | null>(null)

  const fetchDocument = useCallback(async (docId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const doc = await getDocument(docId)
      setDocument(doc)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load document"))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!id) {
      queueMicrotask(() => {
        if (isMounted) {
          setDocument(null)
          setIsLoading(false)
        }
      })
      return
    }

    queueMicrotask(() => {
      if (isMounted) setIsLoading(true)
    })

    getDocument(id)
      .then((doc) => {
        if (isMounted) {
          setDocument(doc)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load document"))
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [id])

  const flushSave = useCallback(async () => {
    if (!id || !pendingContentRef.current) return

    const contentToSave = pendingContentRef.current
    pendingContentRef.current = null
    setIsSaving(true)

    try {
      const updated = await updateDocument(id, { content: contentToSave })
      if (updated) {
        setDocument(updated)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to save document"))
    } finally {
      setIsSaving(false)
    }
  }, [id])

  const saveContent = useCallback(
    (content: JSONContent | string) => {
      pendingContentRef.current = content
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        flushSave()
      }, debounceMs)
    },
    [debounceMs, flushSave]
  )

  const updateTitle = useCallback(
    async (title: string) => {
      if (!id) return
      try {
        const updated = await updateDocument(id, { title })
        if (updated) {
          setDocument(updated)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to update title"))
      }
    },
    [id]
  )

  const refresh = useCallback(async () => {
    if (id) {
      await fetchDocument(id)
    }
  }, [id, fetchDocument])

  return {
    document,
    isLoading,
    isSaving,
    error,
    saveContent,
    updateTitle,
    refresh,
  }
}
