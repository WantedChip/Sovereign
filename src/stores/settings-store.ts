import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { db } from "@/lib/db/schema"

const FIELD_SURVEY_PALETTE = [
  "#C9A227", // Brass
  "#5C7A5C", // Moss
  "#7A2E2E", // Oxblood
  "#D97706", // Amber
  "#059669", // Emerald
  "#0891B2", // Cyan
  "#4F46E5", // Indigo
  "#9333EA", // Purple
]

export function generateRandomUserIdentity(): { username: string; userColor: string } {
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const username = `Surveyor-${randomNum}`
  const userColor = FIELD_SURVEY_PALETTE[Math.floor(Math.random() * FIELD_SURVEY_PALETTE.length)]
  return { username, userColor }
}

interface SettingsState {
  theme: "dark" | "light"
  fontSize: number
  autoSave: boolean
  autoSaveDelay: number
  username: string
  userColor: string
  setTheme: (theme: "dark" | "light") => void
  setFontSize: (size: number) => void
  setAutoSave: (enabled: boolean) => void
  setAutoSaveDelay: (delayMs: number) => void
  setUsername: (name: string) => void
  setUserColor: (color: string) => void
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

const initialIdentity = generateRandomUserIdentity()

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      fontSize: 16,
      autoSave: true,
      autoSaveDelay: 500,
      username: initialIdentity.username,
      userColor: initialIdentity.userColor,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setAutoSaveDelay: (autoSaveDelay) => set({ autoSaveDelay }),
      setUsername: (username) => set({ username }),
      setUserColor: (userColor) => set({ userColor }),
    }),
    {
      name: "sovereign-user-settings",
      storage: createJSONStorage(() => dexieStorage),
    }
  )
)
