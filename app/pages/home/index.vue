<script setup lang="ts">
definePageMeta({
	layout: 'dashboard',
});

const { user } = useAuth();
</script>

<template>
	<div class="lg:h-[calc(100svh-128px)] flex lg:flex-row flex-col gap-2 max-w-2xl mx-auto">
		<div class="flex-1 h-full flex flex-col gap-2">
			<h1 class="text-neutral-50 font-extrabold">Dashboard</h1>
			<Card class="flex-1 backdrop-blur-sm bg-black/10! text-neutral-950/10!">
				<h1 class="text-neutral-50 font-extrabold sm:text-xs text-2xs">
					Hello, {{ user?.username }}!
				</h1>
				<p class="text-neutral-200 text-2xs">
					This is your dashboard. Here you can see which courses you took and come back to them
					later if you wish
				</p>
			</Card>
		</div>
		<div class="flex-1 lg:grid grid-rows-2 flex flex-col gap-2">
			<Card
				class="flex-1 bg-black/50! text-neutral-950/50! backdrop-blur-sm flex flex-col gap-2 max-h-64">
				<h1 class="text-neutral-50 font-extrabold sm:text-xs text-2xs">Recent Courses</h1>
				<div class="grid sm:grid-cols-2 grid-cols-1 gap-2 overflow-auto h-full"></div>
			</Card>
			<Card
				class="flex-1 bg-black/25! text-neutral-950/25! backdrop-blur-sm flex flex-col gap-2 max-h-64">
				<h1 class="text-neutral-50 font-extrabold sm:text-xs text-2xs">Recommended for you</h1>
				<div class="grid sm:grid-cols-2 grid-cols-1 gap-2 overflow-auto h-full"></div>
			</Card>
		</div>
	</div>
</template>
