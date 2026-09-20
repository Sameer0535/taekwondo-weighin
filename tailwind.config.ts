import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olympic: {
          blue: "#0052FF",
          "blue-hover": "#0045D8",
          "blue-light": "#EBF2FF",
          black: "#111827",
          gold: "#D97706",
          green: "#059669",
          red: "#DC2626",
          slate: "#475569",
        },
        surface: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          elevated: "#F1F5F9",
          border: "#E2E8F0",
        },
        status: {
          passed: "#059669",
          "passed-bg": "#ECFDF5",
          "passed-text": "#065F46",
          "passed-border": "#A7F3D0",
          hold: "#D97706",
          "hold-bg": "#FFFBEB",
          "hold-text": "#92400E",
          "hold-border": "#FDE68A",
          rejected: "#DC2626",
          "rejected-bg": "#FEF2F2",
          "rejected-text": "#991B1B",
          "rejected-border": "#FECACA",
          pending: "#64748B",
          "pending-bg": "#F1F5F9",
          "pending-text": "#334155",
          "pending-border": "#CBD5E1",
        },
      },
    },
  },
  plugins: [],
};
export default config;
