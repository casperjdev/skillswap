<script setup lang="ts">
import { useLoading } from '~/composables/useLoading';
import { onMounted, nextTick, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

const { hide } = useLoading();
const router = useRouter();

// Hide loader after initial hydration
onMounted(() => {
	nextTick(() => hide());
});

// Hide loader after every route change
router.afterEach(() => {
	// wait next tick to ensure page content is mounted
	nextTick(() => hide());
});
</script>

<template>
	<Head>
		<Link rel="preconnect" href="https://fonts.googleapis.com" />
		<Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
		<Link
			href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
			rel="stylesheet" />
	</Head>
	<NuxtLayout>
		<GlobalLoader />
		<NuxtPage />
	</NuxtLayout>
	<NuxtRouteAnnouncer />
</template>
