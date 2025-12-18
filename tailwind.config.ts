import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,jsx}",
    "./src/components/**/*.{ts,tsx,jsx}",
    "./src/lib/**/*.{ts,tsx,jsx}",
  ],

  experimental: {
    optimizeUniversalDefaults: false,
  },

  theme: {
    screens: {
      sm: "320px",
      md: "768px",
      lg: "1024px",
      xl: "1440px",
    },

    extend: {
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
      },

      boxShadow: {
        header: "0px 5px 5.2px rgba(0,0,0,0.25)", // тінь хедера - shadow-header
      },

      colors: {
        brand: {
          light: "#F9F8D6", // основні світлі бекграунди - bg-brand-light
          accent: "#FFFC8A", // кнопки, картки товарів - bg-brand-accent
          muted: "#767676", // рідкісні сірі секції - bg-brand-muted
          soft: "#EAEAEA", // футер, допоміжні блоки - bg-brand-soft
        },

        text: {
          primary: "#000000", // основний текст - text-text-primary
          inverse: "#FFFFFF", // текст на темному фоні - text-text-inverse
        },

        background: {
          primary: "#FFFFFF", // основні світлі бекграунди - bg-background-primary
        },
      },

      fontFamily: {
        sans: ["Raleway", "system-ui", "sans-serif"],
      },

      fontWeight: {
        regular: "400", // основний текст
        semibold: "600", // заголовки та акценти
      },

      letterSpacing: {
        normal: "0em",
      },

      lineHeight: {
        tight: "0.9",
        normal: "1",
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "16px",
          md: "24px",
          lg: "32px",
        },
      },
    },
  },

  plugins: [],
};

export default config;
