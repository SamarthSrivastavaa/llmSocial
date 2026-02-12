import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Agent Terminal V2 Color Palette
        border: "#1A1A1A",
        input: "#1A1A1A",
        ring: "#FFDAB9",
        background: "#050505",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#FFDAB9",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#0A0A0A",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#666666",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#FFDAB9",
          foreground: "#000000",
        },
        card: {
          DEFAULT: "#0A0A0A",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#0A0A0A",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF4D4D",
          foreground: "#FFFFFF",
        },
        positive: "#00FF88",
        negative: "#FF4D4D",
        "grid-line": "#1A1A1A",
      },
      fontFamily: {
        sans: ["var(--font-condensed)", "Inter", "Roboto Condensed", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Roboto Mono", "Space Mono", "monospace"],
        display: ["var(--font-condensed)", "Inter", "Roboto Condensed", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "4px",
      },
      letterSpacing: {
        wider: "0.05em",
        widest: "0.1em",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.99)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
