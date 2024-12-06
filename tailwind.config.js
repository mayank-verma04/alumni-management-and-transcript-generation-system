/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/html/**/*.html',
    './public/js/**/*.js',
  ],
  theme: {
    extend: {
      width: {
        400: '400px',
      },
    },
  },
  plugins: [],
};
