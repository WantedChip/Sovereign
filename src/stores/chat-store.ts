import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { SearchResult } from "@/types"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: SearchResult[]
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => string
  updateMessageContent: (id: string, content: string, sources?: SearchResult[]) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => {
        const id = crypto.randomUUID()
        const newMsg: ChatMessage = {
          ...msg,
          id,
          timestamp: Date.now(),
        }
        set((state) => ({ messages: [...state.messages, newMsg] }))
        return id
      },
      updateMessageContent: (id, content, sources) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  content,
                  ...(sources ? { sources } : {}),
                }
              : msg
          ),
        }))
      },
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "sovereign-ai-chat-history",
    }
  )
)
