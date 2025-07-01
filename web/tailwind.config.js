/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		keyframes: {
			spinTilted: {
				'0%': { transform: 'rotateY(0deg) rotateZ(10deg)' },
				'100%': { transform: 'rotateY(360deg) rotateZ(10deg)' },
			},
		},
		animation: {
			spinTilted: 'spinTilted 8s linear infinite',
		},
		plugins: [],
	}
}
