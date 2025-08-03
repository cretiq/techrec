import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Add other paths here if necessary
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate'), // If you are using this plugin
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "light",     // Default light theme - clean and accessible
      "dark",      // Default dark theme - matches glass morphism aesthetic  
      "business"   // Professional theme - ideal for tech recruitment platform
    ],
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
  },
};

export default config;