/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          "card-fields": "#1c2b50",
          "custom-gray": "rgba(64, 64, 64, 0.5)",
        },
        backgroundImage: {
          "dark-gradient":
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7))",
        },
      },
    },
    plugins: [],
  };
  