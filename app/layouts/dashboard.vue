<script setup lang="ts">
import bg from '/img/home.jpg';
</script>

<template>
	<HomeNavbar />
	<main
		class="relative isolate w-svw h-full min-h-svh bg-center bg-cover p-4 pt-12"
		:style="{ backgroundImage: `url(${bg})` }">
		<div
			class="absolute top-0 left-0 w-full h-full bg-neutral-950/50 pattern-[45deg] text-neutral-950/25 backdrop-blur-xs -z-10"></div>
		<slot />
	</main>
</template>
