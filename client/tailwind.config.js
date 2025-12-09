/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#78E6C8',
        secondary: '#FF5B5B',
        background: '#E6E6E6',
        'text-dark': '#2D2D2D',
        'text-light': '#545454',
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        platinum: '#E5E4E2',
        diamond: '#B9F2FF',
        master: '#9966FF',
        challenger: '#FF4500',
        earth: '#F5DEB3',
        fire: '#FF6347',
        wind: '#40E0D0',
        water: '#4169E1',
        mind: '#9370DB',
        // 게임화 색상
        'game-purple': '#A855F7',
        'game-cyan': '#22D3EE',
        'game-pink': '#EC4899',
        'game-neon': '#00FF00',
      },
      fontFamily: {
        sans: ['Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'neon-glow': 'neon-glow 3s infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        'neon-glow': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            boxShadow: '0 0 10px #168d75, 0 0 20px #168d75, 0 0 30px #168d75, 0 0 40px #168d75, inset 0 0 10px rgba(22, 141, 117, 0.5)',
          },
          '20%, 24%, 55%': {
            boxShadow: 'none',
          },
        },
        'slide-in': {
          'from': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'bounce-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      boxShadow: {
        'game': '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)',
        'game-lg': '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(34, 211, 238, 0.4)',
        'neon': '0 0 10px rgba(168, 85, 247, 0.6), 0 0 20px rgba(168, 85, 247, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
