// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	css: ['./app/assets/css/main.css'],
	modules: [
		'@nuxt/content',
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxt/hints',
	],
	vite: { plugins: [tailwindcss()] },
	components: [
		{
			path: '~/components',
			pathPrefix: false,
		},
	],
	icon: {
		mode: 'css',
		cssLayer: 'base',
		serverBundle: {
			collections: ['cib'],
		},
	},
	runtimeConfig: {
		strapiUrl: process.env.STRAPI_URL,
		public: {},
	},
	experimental: {
		inlineRouteRules: true,
	},
	ssr: true,
});
