import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0B1220",
        slatepanel: "#243247",
        panelborder: "#304257",
        neonteal: "#00D6B4",
        limegreen: "#A3E635",
        warningamber: "#FBBF24",
        alertred: "#F87171",
        textheading: "#F1F5F9",
        textmuted: "#94A3B8",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        darkpalette: {
          "primary": "#00D6B4",
          "secondary": "#243247",
          "accent": "#A3E635",
          "neutral": "#304257",
          "base-100": "#243247",
          "base-200": "#0B1220",
          "base-300": "#172638",
          "info": "#00D6B4",
          "success": "#A3E635",
          "warning": "#FBBF24",
          "error": "#F87171",
        },
      },
    ],
  },
};

export default config;
