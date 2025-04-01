import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#8E6F60", // ☕ brownish background
        foreground: "var(--foreground)",
      },
      fontFamily: {
        calibri: ["Calibri", "Segoe UI", "Arial", "sans-serif"], // fallback-safe
      },
    },
  },
  plugins: [],
};

export default config;
