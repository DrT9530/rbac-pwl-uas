/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#1a1a2e",
          50: "#f0f0f7",
          100: "#e1e1ef",
          200: "#c3c3df",
          300: "#9595c8",
          400: "#6767b1",
          500: "#4a4a9a",
          600: "#3b3b7d",
          700: "#2c2c5e",
          800: "#1e1e40",
          900: "#1a1a2e",
        },
        cream: {
          DEFAULT: "#faf8f4",
          50: "#fefefe",
          100: "#faf8f4",
          200: "#f2ede3",
        },
        accent: {
          DEFAULT: "#e85d26",
          hover: "#c94d1e",
          light: "#fde8df",
        },
      },
    },
  },
  plugins: [],
};
