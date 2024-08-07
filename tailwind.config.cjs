/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./app/**/*.{js,ts,jsx,tsx}', 'node_modules/@rjsf/**/*.js'],
	theme: {
		extend: {},
	},
	plugins: [
		// require("@tailwindcss/forms"),
		require('daisyui'),
	],
	daisyui: {
		themes: false,
	},
};
