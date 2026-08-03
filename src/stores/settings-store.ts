import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { db } from "@/lib/db/schema"

interface SettingsState {
  theme: "dark" | "light"
  fontSize: number
  autoSave: boolean
  autoSaveDelay: number
  setTheme: (theme: "dark" | "light") => void
  setFontSize: (size: number) => void
  setAutoSave: (enabled: boolean) => void
  setAutoSaveDelay: (delayMs: number) => void
}

const dexieStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const record = await db.settings.get(name)
      return record ? JSON.stringify(record.value) : null
    } catch {
      return localStorage.getItem(name)
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await db.settings.put({ key: name, value: JSON.parse(value) })
    } catch {
      localStorage.setItem(name, value)
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await db.settings.delete(name)
    } catch {
      localStorage.removeItem(name)
    }
  },
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      fontSize: 16,
      autoSave: true,
      autoSaveDelay: 500,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setAutoSaveDelay: (autoSaveDelay) => set({ autoSaveDelay }),
    }),
    {
      name: "sovereign-user-settings",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
)
