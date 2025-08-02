// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Utilisé par défaut partout
      },
      colors: {
        primary: {
          DEFAULT: "#10b981", // emerald-500
          light: "#6ee7b7",
          dark: "#047857",
        },
        grayText: "#4B5563", // tailwind gray-700
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      spacing: {
        'input-y': '0.5rem',
        'input-x': '0.75rem',
      },
      fontSize: {
        label: ['0.875rem', '1.25rem'], // text-sm with line height
        base: ['1rem', '1.5rem'],       // text-base
      },
    },
  },
  plugins: [],
};
