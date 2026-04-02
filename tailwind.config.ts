import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7e8",
          100: "#ffedbf",
          200: "#ffd46e",
          300: "#ffb84a",
          400: "#ff9b2f",
          500: "#f57a1f",
          600: "#d45914",
          700: "#ad3d12",
          800: "#8c3116",
          900: "#732915",
        },
        ocean: {
          50: "#eefcff",
          100: "#d5f5fb",
          200: "#9de8f4",
          300: "#55d6eb",
          400: "#22bdd8",
          500: "#12a0bb",
          600: "#138198",
          700: "#15687b",
          800: "#195566",
          900: "#194756",
        },
      },
      boxShadow: {
        card: "0 18px 60px rgba(17, 24, 39, 0.12)",
        glow: "0 0 0 8px rgba(34, 211, 238, 0.18)",
      },
      backgroundImage: {
        confetti:
          "radial-gradient(circle at 10% 20%, rgba(255, 184, 74, 0.25) 0, transparent 24%), radial-gradient(circle at 80% 15%, rgba(34, 211, 238, 0.2) 0, transparent 20%), radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.18) 0, transparent 22%)",
      },
      fontFamily: {
        display: ['"Trebuchet MS"', '"Avenir Next"', "sans-serif"],
        body: ['"Verdana"', '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
