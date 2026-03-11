import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  activeWorkspaceId: string | null;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  setActiveWorkspace: (id: string) => void;
  toggleCommandPalette: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeWorkspaceId: null,
  commandPaletteOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
}));
