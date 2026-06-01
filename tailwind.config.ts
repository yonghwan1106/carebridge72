import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cb: {
          primary: "#0E4D8C",
          "primary-dark": "#0B3D6B",
          "primary-light": "#E8F1FB",
          accent: "#0E9594",
          "accent-light": "#E0F2F1",
          ink: "#0F1B2D",
          muted: "#5A6B82",
          surface: "#F5F8FC",
          border: "#DCE4EE",
          danger: "#DC2626",
          warn: "#EA580C",
          amber: "#B7791F",
          ok: "#15803D",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "Pretendard Variable",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Malgun Gothic",
          "Apple SD Gothic Neo",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,27,45,0.04), 0 8px 24px rgba(15,27,45,0.06)",
        "card-hover": "0 2px 4px rgba(15,27,45,0.06), 0 12px 32px rgba(15,27,45,0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.1)", opacity: "0" },
          "100%": { transform: "scale(1.1)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
