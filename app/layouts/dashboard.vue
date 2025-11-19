<script setup lang="ts">
import bg from '@/assets/images/home.jpg';
</script>

<template>
	<HomeNavbar />
	<main
		class="relative w-svw h-svh bg-center bg-cover p-4 pt-12 grid place-items-center"
		:style="{ backgroundImage: `url(${bg})`, zIndex: -100 }">
		<div
			class="absolute top-0 left-0 w-full h-full bg-neutral-950/50 pattern-[45deg] text-neutral-950/25 -z-50 backdrop-blur-xs"></div>
		<slot />
	</main>
</template>
