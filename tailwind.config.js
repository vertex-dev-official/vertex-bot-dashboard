/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#9B6FBF",
        surface: "#171223",
        background: "#0F0B17",
      },
    },
  },
  plugins: [],
};
