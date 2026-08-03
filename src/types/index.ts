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
