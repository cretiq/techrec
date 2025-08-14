import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './types/**/*.{js,ts,jsx,tsx}',
    // Add other paths here if necessary
  ],
  // TailwindCSS v4: darkMode configured in CSS with @custom-variant
  plugins: [
    require('tailwindcss-animate'),
    require('daisyui'),
  ],
  daisyui: {
    themes: ["pastel", "night"],
    darkTheme: "night",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
  },
};

export default config;