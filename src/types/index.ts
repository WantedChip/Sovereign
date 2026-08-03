import type { JSONContent } from "@tiptap/react"

export interface Document {
  id: string
  title: string
  content: JSONContent | string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  wordCount: number
}

export interface DocumentMeta {
  id: string
  title: string
  updatedAt: Date
  wordCount: number
  tags: string[]
}

export interface Setting {
  key: string
  value: unknown
}

export interface LinkEntry {
  id?: number
  sourceId: string
  targetTitle: string
  targetId: string | null
}

export interface BacklinkWithContext {
  id?: number
  sourceId: string
  sourceTitle: string
  targetTitle: string
  targetId: string | null
  snippet: string
}
