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
  ],
};

export default config;