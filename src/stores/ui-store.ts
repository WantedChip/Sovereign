import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  sidebarWidth: number
  rightPanelOpen: boolean
  rightPanelView: "graph" | "ai" | "none"
  commandPaletteOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  toggleRightPanel: () => void
  setRightPanelOpen: (open: boolean) => void
  setRightPanelView: (view: "graph" | "ai" | "none") => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarWidth: 280,
  rightPanelOpen: true,
  rightPanelView: "graph",
  commandPaletteOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setRightPanelView: (view) => set({ rightPanelView: view }),
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))
