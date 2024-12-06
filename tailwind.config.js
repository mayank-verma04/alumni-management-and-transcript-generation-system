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
        180: '180px',
        232: '232px',
      },
      height: {
        510: '510px',
        78: '78px',
      },
    },
  },
  plugins: [],
};
