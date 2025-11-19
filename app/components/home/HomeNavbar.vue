<script setup lang="ts">
const route = useRoute();

let path = computed(() => {
	return route.path;
});
</script>

<template>
	<nav class="w-full bg-neutral-950 fixed top-0 left-0 z-100">
		<div class="w-full h-8 px-4 max-w-2xl mx-auto flex flex-row gap-4 items-center">
			<span
				class="block w-max font-extrabold italic text-xs text-transparent bg-linear-180 from-50% from-neutral-50 to-100% to-neutral-400 bg-clip-text">
				youth2youth
			</span>
			<div class="text-2xs h-full text-neutral-50 flex flex-row">
				<NuxtLink :class="['h-full px-2 grid place-items-center cursor-pointer']">Home</NuxtLink>
				<NuxtLink :class="['h-full px-2 grid place-items-center cursor-pointer']"
					>Discover</NuxtLink
				>
				<NuxtLink :class="['h-full px-2 grid place-items-center cursor-pointer']"
					>Teachers</NuxtLink
				>
				<NuxtLink :class="['h-full px-2 grid place-items-center cursor-pointer']">Create</NuxtLink>
			</div>
		</div>
		<Separator />
	</nav>
</template>
