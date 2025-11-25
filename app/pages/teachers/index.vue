<script setup lang="ts">
import type { StrapiUser } from '~/types/strapi/auth';

definePageMeta({
	layout: 'dashboard',
});

const searchString = ref('');
const resultUsers = ref<StrapiUser[] | null>();
const loading = ref(false);
let debounce: NodeJS.Timeout;

async function search() {
	if (debounce) clearTimeout(debounce);

	debounce = setTimeout(async () => {
		if (searchString.value.trim() !== '') {
			loading.value = true;
			const res = await $fetch('/api/auth/users', {
				query: { q: searchString.value, populate: 'tags' },
			});

			resultUsers.value = res?.users;
			loading.value = false;
		}
	}, 500);
}
</script>

<template>
	<div class="h-[calc(100svh-128px)] flex flex-col items-center gap-2 mx-auto">
		<h1 class="text-neutral-50 font-extrabold text-center">Verified Teachers</h1>
		<input
			v-model="searchString"
			@input="search()"
			type="text"
			name="search"
			placeholder="Search..."
			id="search"
			class="sm:w-1/2 w-full rounded-md p-1 text-white font-light text-2xs backdrop-blur-[1px] bg-neutral-50/5 border border-neutral-200/80" />
		<Card class="w-full backdrop-blur-sm bg-black/10! text-neutral-950/10! flex-1 overflow-auto">
			<div v-if="loading" class="w-full h-full grid place-items-center">
				<Icon name="lucide:loader-2" class="text-neutral-50 w-8 h-8 animate-spin" />
			</div>
			<div v-if="!loading" class="grid gap-2 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
				<Card
					class="w-full h-full relative overflow-hidden z-0 flex flex-col gap-1 justify-start"
					v-for="user in resultUsers">
					<h1 class="text-neutral-50 sm:text-xs text-2xs font-extrabold">{{ user.username }}</h1>
					<p class="text-neutral-200 text-2xs">{{ user.email }}</p>
					<div class="flex flex-row gap-2 flex-wrap mt-auto">
						<span
							class="text-[12px] text-neutral-200 bg-white/20 px-2 py-0.5 rounded-md"
							v-if="user.tags && user.tags.length > 0"
							v-for="tag in user.tags"
							>{{ tag.label }}</span
						>
						<p v-else class="text-[12px] text-neutral-200 font-bold">No tags</p>
					</div>
				</Card>
			</div>
		</Card>
	</div>
</template>
