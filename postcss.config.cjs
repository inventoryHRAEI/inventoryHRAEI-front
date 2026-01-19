module.exports = {
  plugins: {
    // Tailwind v4+ moved the PostCSS integration to a separate package.
    // Use '@tailwindcss/postcss' here so PostCSS processing succeeds under Vite.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}
