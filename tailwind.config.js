/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0085FD"
        }
      }
    }
  },
  plugins: []
}
