<template>
	<transition name="fade-out">
		<div v-if="loading" class="fixed inset-0 flex items-center justify-center bg-neutral-950 z-500">
			<Icon name="lucide:loader" class="animate-spin w-8 h-8 text-neutral-50" />
		</div>
	</transition>
</template>

<script setup lang="ts">
import { loading } from '~/composables/useLoading';
</script>

<style>
.fade-out-enter-active {
	transition: none; /* appear instantly */
}
.fade-out-enter-from {
	opacity: 1;
}
.fade-out-leave-active {
	transition: opacity 0.3s ease; /* fade out */
}
.fade-out-leave-to {
	opacity: 0;
}
</style>
