export const theme = {
  colors: {
    primary: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
      950: "#1e1b4b",
    },
    accent: {
      cyan: "#06b6d4",
      violet: "#8b5cf6",
      fuchsia: "#d946ef",
      emerald: "#10b981",
    },
    surface: {
      glass: "rgba(255, 255, 255, 0.05)",
      glassLight: "rgba(255, 255, 255, 0.1)",
      glassBorder: "rgba(255, 255, 255, 0.15)",
      dark: "#0a0a1a",
      darkAlt: "#111128",
      card: "#16163a",
    },
    neural: {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      glow: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #d946ef 100%)",
      mesh: "radial-gradient(at 40% 20%, #1e1b4b 0px, transparent 50%), radial-gradient(at 80% 0%, #312e81 0px, transparent 50%), radial-gradient(at 0% 50%, #0a0a1a 0px, transparent 50%)",
    },
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },
  blur: {
    glass: "16px",
    heavy: "32px",
    light: "8px",
  },
  spacing: {
    panel: "1.5rem",
    card: "1.25rem",
    section: "3rem",
  },
} as const;
