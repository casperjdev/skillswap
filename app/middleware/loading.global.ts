import { useLoading } from '~/composables/useLoading';

export default defineNuxtRouteMiddleware((to, from) => {
	const { show } = useLoading();

	// Only show loader on client
	if (import.meta.client) {
		show();
	}
});
