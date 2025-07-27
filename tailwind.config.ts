import type { Config } from "tailwindcss"
import path from "path"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  content: [
    path.join(__dirname, "pages/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "components/**/*.{js,ts,jsx,tsx,mdx}"),
    path.join(__dirname, "app/**/*.{js,ts,jsx,tsx,mdx}"),
  ],
  darkMode: "class", // Enable dark mode via class strategy
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
                primary: {
                  DEFAULT: "hsl(var(--primary))",
                },
              },
            },
          },
          plugins: [tailwindcssAnimate],
        }
        
        export default config
