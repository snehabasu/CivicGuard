import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#2B7A78",
          dark: "#17252A",
          light: "#A8D5D1",
          lighter: "#DEF2F1",
        },
        amber: {
          DEFAULT: "#E8A838",
        },
        surface: {
          DEFAULT: "#FAF9F6",
          card: "#F0EFEB",
          hover: "#E8E7E3",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        ".scrollbar-none": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".scrollbar-none::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};

export default config;
