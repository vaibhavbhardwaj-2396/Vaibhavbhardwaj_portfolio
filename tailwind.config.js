/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          DEFAULT: '#1B4D3E',
          50: '#F0F7F4',
          700: '#143D31',
        },
        sage: {
          DEFAULT: '#D1E2C4',
          50: '#F7FAF5',
        },
        dark: {
          bg: '#242424',
          surface: '#2F2F2F',
          text: '#E1E1E1',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      spacing: {
        section: '32px',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        scroll: 'scroll 30s linear infinite',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
      },
      scale: {
        '115': '1.15',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        slideUp: {
          from: {
            transform: 'translateY(100%)',
            opacity: '0'
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        }
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1200px',
      },
      maxWidth: {
        'content': '65ch',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#1B4D3E',
            h1: {
              fontFamily: 'Montserrat, sans-serif',
            },
            h2: {
              fontFamily: 'Montserrat, sans-serif',
            },
            h3: {
              fontFamily: 'Montserrat, sans-serif',
            },
            h4: {
              fontFamily: 'Montserrat, sans-serif',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};