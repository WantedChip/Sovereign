import { create } from "zustand"
import { listDocuments } from "@/lib/db/operations"
import type { DocumentMeta } from "@/types"

interface DocumentState {
  activeDocumentId: string | null
  documents: DocumentMeta[]
  setActiveDocumentId: (id: string | null) => void
  setDocuments: (docs: DocumentMeta[]) => void
  refreshDocumentList: () => Promise<DocumentMeta[]>
}

export const useDocumentStore = create<DocumentState>((set) => ({
  activeDocumentId: null,
  documents: [],
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),
  setDocuments: (docs) => set({ documents: docs }),
  refreshDocumentList: async () => {
    const docs = await listDocuments()
    set({ documents: docs })
    return docs
  },
}))
