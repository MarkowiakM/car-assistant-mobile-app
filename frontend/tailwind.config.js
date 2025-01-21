/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      screens: {
        sm: "720px",
        md: "1024px",
        lg: "1280px",
        xl: "1920px",
        "2xl": "2048px",
      },
      fontFamily: {
        lato: ["Lato, ui-sans-serif, system-ui"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
        "rack-blue": "hsl(var(--rack-blue))",
        green: "hsl(var(--green))",
        "green-light": "hsl(var(--green-light))",
        "green-background": "hsl(var(--green-background))",
        red: "hsl(var(--red))",
        "red-light": "hsl(var(--red-light))",
        "red-background": "hsl(var(--red-background))",
        purple: "hsl(var(--purple))",
        disabled: "hsl(var(--disabled))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      },
  },
  plugins: [],
}
