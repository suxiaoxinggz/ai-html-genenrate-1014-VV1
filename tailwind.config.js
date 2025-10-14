/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      }
    }
  },
  plugins: [
    // Add typography plugin for better text styling
    // require('@tailwindcss/typography')
  ]
}