/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f9ff", // Sky 50
        foreground: "#0c4a6e", // Sky 900
        primary: {
          DEFAULT: "#0ea5e9", // Sky 500
          hover: "#38bdf8", // Sky 400
        },
        secondary: {
          DEFAULT: "#3b82f6",
        },
        accent: {
          DEFAULT: "#10b981",
        },
        danger: {
          DEFAULT: "#ef4444",
        },
        card: "rgba(255, 255, 255, 0.05)",
        border: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s forwards',
        'slide-out-left': 'slideOutLeft 0.4s forwards',
        'spin': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-50px)', display: 'none' },
        },
        spin: {
          '100%': { transform: 'rotate(360deg)' },
        },
      }
    },
  },
  plugins: [],
}
