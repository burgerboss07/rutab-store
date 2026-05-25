import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rutab: {
          cream: '#F7F2EB',
          brown: '#7A4B2A',
          dark: '#3A2416',
          soft: '#E9DDCF',
        }
      }
    },
  },
  plugins: [],
};

export default config;
