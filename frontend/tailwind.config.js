/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: "#3B9E59",
          50: "#E8F5EC",
          100: "#C5E6D0",
          200: "#9ED5B1",
          300: "#6DC18E",
          400: "#4DAF72",
          500: "#3B9E59",
          600: "#2F8A4B",
          700: "#23763D",
          800: "#1A632F",
          900: "#104F22",
        },
        electric: {
          DEFAULT: "#008BE2",
          50: "#E0F2FE",
          100: "#B3DFFB",
          200: "#80CBF8",
          300: "#4DB6F4",
          400: "#26A5F0",
          500: "#008BE2",
          600: "#0078C4",
          700: "#0065A6",
          800: "#005288",
          900: "#003F6A",
        },
        ink: {
          DEFAULT: "#6B6D6B",
          50: "#F0F0F0",
          100: "#D9D9D9",
          200: "#BFBFBF",
          300: "#A3A3A3",
          400: "#8C8C8C",
          500: "#6B6D6B",
          600: "#555555",
          700: "#404040",
          800: "#2B2B2B",
          900: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
