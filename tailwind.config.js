const colors = require('tailwindcss/colors')

module.exports = {
    mode: 'jit',
    content: [
        './src/**/*.{html,njk,js,svg}'
    ],
    darkMode: 'class',
    theme: {
        fontFamily: {
            sans: ['Manrope', 'system-ui', 'sans-serif'],
        },
        extend: {
            colors: {
                'main-dark': "#020F19",
                'main-light': "#FFF",
                'accent': "#FF594D",
            }
        },
    },
    plugins: [],
}
