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
    },
  },
  plugins: [],
};
