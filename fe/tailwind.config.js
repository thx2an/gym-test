/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#E11D48', // Example Rose-600
                secondary: '#0F172A', // Example Slate-900
                accent: '#F43F5E',
            },
        },
    },
    plugins: [],
}
