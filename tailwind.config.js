/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: "jit",
    darkMode: "class",
    content: ["./components/**/*.tsx", "./popup.tsx"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#4281FF",// #4281FF
                },
            },
        },
    },
    plugins: [],
};
