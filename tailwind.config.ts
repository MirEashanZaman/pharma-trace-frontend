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
        pharmadark: "#102A43",
        pharmalight: "#F4F8FB",
        pharmateal: "#16B8A6",
        pharmagreen: "#16A36A",
        pharmaamber: "#D97706",
        pharmared: "#DC4545",
        pharmaslate: "#52677A",
      },
    },
  },
  plugins: [],
};

export default config;
