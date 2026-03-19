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
        purple: 'var(--purple)',
        teal: 'var(--teal)',
        pink: 'var(--pink)',
        blue: 'var(--blue)',
        bg: 'var(--bg)',
        surface1: 'var(--surface1)',
        surface2: 'var(--surface2)',
        surface3: 'var(--surface3)',
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
