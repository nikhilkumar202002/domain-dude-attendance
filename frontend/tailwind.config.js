/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This tells Tailwind to scan ALL files in src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}