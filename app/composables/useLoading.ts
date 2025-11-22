import { ref } from 'vue';

export const loading = ref(false);

export function useLoading() {
	return {
		loading,
		show: () => (loading.value = true),
		hide: () => (loading.value = false),
	};
}
