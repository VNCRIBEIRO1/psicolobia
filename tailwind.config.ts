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
        primary: { DEFAULT: "#D4A574", dark: "#B8895C", light: "#E8C9A8" },
        accent: { DEFAULT: "#E8A0BF", light: "#F5C8DE" },
        bg: { DEFAULT: "#FFF5EE", white: "#FFFFFF", soft: "#FDE8D8", warm: "#F9EDE3" },
        txt: { DEFAULT: "#3D2B1F", light: "#6B5445", muted: "#A08E82" },
      },
      fontFamily: {
        heading: ["Fraunces", "Georgia", "serif"],
        body: ["Commissioner", "system-ui", "sans-serif"],
      },
      borderRadius: {
        brand: "18px",
        "brand-sm": "10px",
        "brand-full": "50px",
      },
    },
  },
  plugins: [],
};
export default config;
