import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx,jsx,js}',
    './src/components/**/*.{ts,tsx,jsx,js}',
    './src/lib/**/*.{ts,tsx,jsx,js}',
  ],

  experimental: {
    optimizeUniversalDefaults: false,
  },

  theme: {
    screens: {
      sm: '320px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
    },

    extend: {
      fontSize: {
        'h-xl': [
          // heading-xl
          '47px',
          {
            lineHeight: '50px',
            fontWeight: '400',
          },
        ],
        'h-lg': [
          // heading-lg
          '40px',
          {
            lineHeight: '50px',
            fontWeight: '400',
          },
        ],
        'h-sm': [
          // heading-sm
          '30px',
          {
            lineHeight: '50px',
            fontWeight: '400',
          },
        ],
        'h-default': [
          // heading
          '26px',
          {
            lineHeight: '50px',
            fontWeight: '400',
          },
        ],
        'h-accent': [
          // heading-accent
          'inherit',
          {
            lineHeight: '43px',
            fontWeight: '600',
          },
        ],
      },

      boxShadow: {
        header: '0px 5px 5.2px rgba(0,0,0,0.25)', // тінь хедера - shadow-header
      },

      colors: {
        brand: {
          light: '#F9F8D6', // основні світлі бекграунди - bg-brand-light
          accent: '#FFFC8A', // кнопки, картки товарів - bg-brand-accent
          muted: '#767676', // рідкісні сірі секції - bg-brand-muted
          soft: '#EAEAEA', // футер, допоміжні блоки - bg-brand-soft
        },

        text: {
          primary: '#000000', // основний текст - text-text-primary
          inverse: '#FFFFFF', // текст на темному фоні - text-text-inverse
          gray: '#555555', // text-text-gray
        },

        background: {
          primary: '#FFFFFF', // основні світлі бекграунди - bg-background-primary
          grizzly: '#F4F4F4', // bg-background-grizzly
        },
      },

      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        regular: '400', // основний текст
        semibold: '600', // заголовки та акценти
      },

      letterSpacing: {
        normal: '0em',
      },

      lineHeight: {
        tight: '0.9',
        normal: '1',
      },

      container: {
        center: true,
        padding: {
          DEFAULT: '16px',
          md: '24px',
          lg: '32px',
        },
      },
    },
  },

  plugins: [],
};

export default config;
