import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        flash: 'flash 2s ease-in-out',
      },
      keyframes: {
        flash: {
          '0%, 100%': { backgroundColor: 'rgba(59, 130, 246, 0)' },
          '50%': { backgroundColor: 'rgba(59, 130, 246, 0.5)' },
        }
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
