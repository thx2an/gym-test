/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    500: '#f43f5e',
                    600: '#e11d48', // Brand
                    700: '#be123c',
                },
                slate: {
                    800: '#1e293b',
                    900: '#0f172a', // Text Dark
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
