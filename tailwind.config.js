/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Apple Color Emoji", "Segoe UI Emoji"]
      },
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9ebff",
          200: "#b8d9ff",
          300: "#8ec1ff",
          400: "#5ea2ff",
          500: "#397fff",
          600: "#2563eb",  // primary
          700: "#1d4ed8",
          800: "#1e3a8a",
          900: "#172554"
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f8f9fb",
          strong: "#f2f3f7",
          ring: "#e5e7eb"
        },
        text: {
          DEFAULT: "#0b1220",
          soft: "#5b6170",
          faint: "#8a90a2",
          onBrand: "#ffffff"
        }
      },
      borderRadius: {
        lg: "12px",
        xl: "16px",
        "2xl": "20px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)",
        hover: "0 6px 24px rgba(16,24,40,.10)"
      },
      maxWidth: {
        container: "1120px"
      }
    }
  },
  plugins: []
};
