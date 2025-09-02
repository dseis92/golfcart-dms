/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#2563eb" },
        accent: { DEFAULT: "#16a34a" },
      },
    },
  },
  plugins: [],
};