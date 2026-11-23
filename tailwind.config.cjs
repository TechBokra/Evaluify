/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 800: '#115e59',
          900: '#134e4a', 950: '#042f2e',
        },
      },
    },
  },
  // Existing legacy components sometimes compose contextual utility classes.
  // Keep their color variants until those components use explicit class maps.
  safelist: [
    {
      pattern: /^(bg|text|border|ring)-(blue|green|purple|red|yellow|teal|indigo|orange)-(100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'dark'],
    },
  ],
  plugins: [],
};
