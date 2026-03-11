import { create } from "zustand";

type Theme = "light" | "dark";

interface UserProfile {
  id: string;
  organizationId: string | null;
  workspaceId: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

interface AppState {
  sidebarOpen: boolean;
  activeWorkspaceId: string | null;
  commandPaletteOpen: boolean;
  userProfile: UserProfile | null;
  theme: Theme;
  toggleSidebar: () => void;
  setActiveWorkspace: (id: string) => void;
  toggleCommandPalette: () => void;
  setUserProfile: (profile: UserProfile) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("aios-theme") as Theme | null;
  return saved === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("aios-theme", theme);
}

// Apply initial theme immediately
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeWorkspaceId: null,
  commandPaletteOpen: false,
  userProfile: null,
  theme: initialTheme,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setUserProfile: (profile) => set({ userProfile: profile, activeWorkspaceId: profile.workspaceId }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    }),
}));
