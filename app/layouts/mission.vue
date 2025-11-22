<script setup lang="ts">
import bgImage from '@/assets/images/mission.jpg';
</script>

<template>
	<main
		class="relative isolate w-svw h-full min-h-svh bg-center bg-fixed bg-cover"
		:style="{ backgroundImage: `url(${bgImage})` }">
		<div
			class="absolute top-0 left-0 w-full h-full bg-neutral-950/50 pattern-[45deg] text-neutral-950/25 backdrop-blur-xs -z-10"></div>
		<slot />
		<HeroFooter />
	</main>
</template>
<script setup lang="ts"></script>
