/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/*.ejs}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#2f68c5",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      fontFamily: {
        "cool-heading": ["Montserrat", "sans-serif"],
        "cool-body": ["Roboto", "sans-serif"],
      },
      fontSize: {
        "cool-xs": "0.75rem",
        "cool-sm": "0.875rem",
        "cool-base": "1rem",
        "cool-lg": "1.125rem",
        "cool-xl": "1.25rem",
        "cool-2xl": "1.5rem",
      },
      boxShadow: {
        "cool-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "cool-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "cool-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
