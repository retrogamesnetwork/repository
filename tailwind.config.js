module.exports = {
    purge: [
        "src/**/*.ts",
        "./**/*.njk",
        "./.eleventy.js",
    ],
    darkMode: false,
    theme: {
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: ["light"],
    },
};
