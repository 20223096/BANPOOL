import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 32px rgba(56, 189, 248, 0.25)",
        bubble: "0 4px 14px rgba(15, 23, 42, 0.12)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        splash: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "40%": { opacity: "1", transform: "scale(1.05)" },
          "100%": { opacity: "0", transform: "scale(1.2)" },
        },
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite",
        splash: "splash 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
