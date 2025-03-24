/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'chart-blue': '#3b82f6',
        'chart-red': '#ef4444',
        'chart-gray': '#64748b',
        // Tropical Fruit Punch Color Palette
        'tropical-1': '#146152', // Dark green
        'tropical-2': '#44803F', // Medium green
        'tropical-3': '#B4CF66', // Light green
        'tropical-4': '#FFEC5C', // Yellow
        'tropical-5': '#FF5A33', // Orange-red
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}