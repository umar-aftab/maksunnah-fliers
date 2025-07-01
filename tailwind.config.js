/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3F3D56',    // Deep Indigo
        accent: '#A24C44',     // Soft Maroon
        accent2: '#B55C50',    // Terracotta (optional)
        background: '#F7F5F2', // Light Taupe
        text: '#2E2E2E',       // Charcoal Grey
        gold: '#C1A260',       // Muted Gold
      }
    }
  },
  plugins: [],
}