module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/flowbite-datepicker/**/*.{js,css}',
    './node_modules/flowbite/**/*.{js,css}'
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
