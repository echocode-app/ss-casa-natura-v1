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
        'h-xl': ['47px', { lineHeight: 'clamp(32px,4vw,46px)', fontWeight: '400' }], // use text-h-xl
        'h-lg': ['40px', { lineHeight: 'clamp(30px,5vw,46px)', fontWeight: '400' }], // use text-h-lg
        'h-sm': ['30px', { lineHeight: 'clamp(30px,5vw,46px)', fontWeight: '400' }], // use text-h-sm
        'h-default': ['26px', { lineHeight: 'clamp(30px,5vw,46px)', fontWeight: '400' }], // text-h-default
        'h-accent': ['inherit', { lineHeight: 'clamp(30px,5vw,43px)', fontWeight: '600' }], // text-h-accent
      },

      fontVariantNumeric: {
        tabular: 'tabular-nums', // use font-variant-tabular
      },

      boxShadow: {
        header: '0px 5px 5.2px rgba(0,0,0,0.25)', // use shadow-header
      },

      borderRadius: {
        'modal-xl': '31px', // use rounded-modal-xl for modal container
        'modal-sm': '18px', // use rounded-modal-sm for modal container
        'input-xxl': '49px', // use rounded-input-xxl for inputs
        'input-xl': '16px', // use rounded-input-xl for inputs
        'input-sm': '10px', // use rounded-input-sm for inputs
        'button-sm': '8px', // use rounded-button-sm for inputs
      },

      borderWidth: {
        input: '1px', // use border-input
      },

      borderColor: {
        input: 'rgba(162,162,162,1)', // use border-input
      },

      colors: {
        brand: {
          light: '#F9F8D6', // bg-brand-light
          accent: '#FFFC8A', // bg-brand-accent
          muted: '#767676', // bg-brand-muted
          soft: '#EAEAEA', // bg-brand-soft
        },
        text: {
          primary: '#000000', // text-text-primary
          extrablack: '#151515', // text-text-extrablack
          inverse: '#FFFFFF', // text-text-inverse
          gray: '#555555', // text-text-gray
          soft: '#535353', // text-text-soft
        },
        background: {
          light: '#fdfcfa', // bg-background-light
          primary: '#FFFFFF', // bg-background-primary
          grizzly: '#F4F4F4', // bg-background-grizzly
          secondary: '#FAFAFA', // bg-background-secondary
          overlay: 'rgba(0,0,0,0.58)', // bg-background-overlay
          gray: '#595959', // bg-background-gray
          green: '#D4FFAD', // bg-background-green
        },
      },

      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'], // font-sans
      },

      fontWeight: {
        regular: '400', // font-regular
        semibold: '600', // font-semibold
      },

      letterSpacing: {
        normal: '0em', // tracking-normal
      },

      lineHeight: {
        tight: '0.9', // leading-tight
        normal: '1', // leading-normal
      },

      container: {
        center: true,
        padding: {
          DEFAULT: '16px', // container px-4
          md: '24px', // container md:px-6
          lg: '32px', // container lg:px-8
        },
      },
    },
  },

  plugins: [],
};

export default config;
