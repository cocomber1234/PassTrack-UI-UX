import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        ink: "#17233a",
        muted: "#718096",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3378e8",
          600: "#2563d9",
          700: "#1d4fb7",
          900: "#123b86",
        },
      },
      boxShadow: {
        card: "0 14px 40px rgb(27 56 104 / 6%)",
      },
    },
  },
  plugins: [],
};

export default config;
