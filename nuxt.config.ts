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
		'nuxt-toast',
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
		payloadExtraction: false,
	},

	ssr: true,
	toast: {
		settings: {
			position: 'bottomCenter',
			timeout: 2000,
			closeOnEscape: true,
			closeOnClick: true,
		},
	},
	image: {
		strapi: {
			baseURL: 'http://54.38.138.75:1337',
		},
	},
	nitro: {
		preset: 'vercel',
	},
});
