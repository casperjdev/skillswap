<script setup lang="ts">
import type { Course, CourseList } from '~/types/strapi/courses';

definePageMeta({
	layout: 'dashboard',
});

const searchString = ref('');
const resultCourses = ref<Course[] | null>();
const loading = ref(false);
let debounce: NodeJS.Timeout;

async function search() {
	if (debounce) clearTimeout(debounce);

	debounce = setTimeout(async () => {
		if (searchString.value.trim() !== '') {
			loading.value = true;
			const res = await $fetch('/api/courses', {
				query: { q: searchString.value, populate: 'tags' },
			});

			resultCourses.value = res?.res.data;
			loading.value = false;
		}
	}, 500);
}
</script>

<template>
	<div class="h-[calc(100svh-128px)] flex flex-col items-center gap-2 mx-auto">
		<h1 class="text-neutral-50 font-extrabold text-center">Discover Courses</h1>
		<input
			v-model="searchString"
			@input="search()"
			type="text"
			name="search"
			placeholder="Search..."
			id="search"
			class="sm:w-1/2 w-full rounded-md p-1 text-white font-light text-2xs backdrop-blur-[1px] bg-neutral-50/5 border border-neutral-200/80" />
		<Card class="w-full backdrop-blur-sm bg-black/10! text-neutral-950/10! flex-1 overflow-scroll">
			<div v-if="loading" class="w-full h-full grid place-items-center">
				<Icon name="lucide:loader-2" class="text-neutral-50 w-8 h-8 animate-spin" />
			</div>
			<div v-if="!loading" class="grid gap-2 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
				<Course v-for="course in resultCourses" :data="course" />
			</div>
		</Card>
	</div>
</template>
