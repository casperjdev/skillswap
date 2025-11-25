<script setup lang="ts">
import type { Course } from '~/types/strapi/courses';

definePageMeta({
	layout: 'dashboard',
});

const { user } = useAuth();
// Last course
const id = useCookie('lastCourse');
const latestCourse = ref<Course | null>();
const latestLoading = ref(false);
const recommendedCourses = ref<Course[] | null>();
const reccLoading = ref(false);

onMounted(async () => {
	const promises = [];

	if (id.value) {
		latestLoading.value = true;

		const latestPromise = $fetch<any>(`/api/courses/${id.value}`)
			.then((response) => {
				const strapiResponse = response.res || response;
				latestCourse.value = strapiResponse?.data || strapiResponse;
			})
			.finally(() => {
				latestLoading.value = false;
			});

		promises.push(latestPromise);
	}

	if (user) {
		reccLoading.value = true;

		const recPromise = $fetch(`/api/auth/recommended`)
			.then((res) => {
				recommendedCourses.value = res?.res.data;
			})
			.finally(() => {
				reccLoading.value = false;
			});

		promises.push(recPromise);
	}

	await Promise.all(promises);
});
</script>

<template>
	<div class="lg:h-[calc(100svh-128px)] flex lg:flex-row flex-col gap-2 max-w-2xl mx-auto">
		<div class="flex-1 h-full flex flex-col gap-2">
			<h1 class="text-neutral-50 font-extrabold">Dashboard</h1>
			<Card class="flex-1 backdrop-blur-sm bg-black/10! text-neutral-950/10! flex flex-col gap-1">
				<h1 class="text-neutral-50 font-extrabold sm:text-xs text-2xs">
					Hello, {{ user?.username }}!
				</h1>
				<p class="text-neutral-200 text-2xs">
					This is your dashboard. Here you can see which courses you took and come back to them
					later if you wish
				</p>
				<p class="text-neutral-50 sm:text-xs text-2xs font-extrabold">
					You can also start something new with the reccomendations we have for you today!
				</p>
			</Card>
		</div>
		<div class="flex-1 lg:grid grid-rows-2 flex flex-col gap-2">
			<Card
				class="flex-1 bg-black/50! text-neutral-950/50! backdrop-blur-sm flex flex-col gap-2 max-h-64">
				<h1 class="text-neutral-50 font-extrabold sm:text-xs text-2xs">Continue</h1>
				<Course v-if="!latestLoading && latestCourse" :data="latestCourse" />
				<div
					v-else-if="latestLoading"
					class="text-neutral-200 w-full h-full grid place-items-center sm:text-xs text-2xs">
					<Icon name="lucide:loader-2" class="text-neutral-50 w-8 h-8 animate-spin" />
				</div>
				<div
					v-else
					class="text-neutral-200 w-full h-full grid place-items-center sm:text-xs text-2xs">
					You havent started any courses.
				</div>
			</Card>
			<Card
				class="flex-1 bg-black/25! text-neutral-950/25! backdrop-blur-sm flex flex-col gap-2 max-h-64">
				<h1 class="text-neutral-50 font-extrabold sm:text-xs text-2xs">Recommended for you</h1>
				<div
					v-if="
						!reccLoading &&
						user?.tags &&
						user.tags.length > 0 &&
						recommendedCourses &&
						recommendedCourses?.length > 0
					"
					class="flex flex-col gap-2 overflow-y-auto h-full">
					<Course v-for="course in recommendedCourses.slice(0, 4)" :data="course" />
				</div>
				<div
					v-else-if="reccLoading"
					class="text-neutral-200 w-full h-full grid place-items-center sm:text-xs text-2xs">
					<Icon name="lucide:loader-2" class="text-neutral-50 w-8 h-8 animate-spin" />
				</div>
				<div
					v-else-if="user?.tags.length == 0"
					class="text-neutral-200 w-full h-full grid place-items-center sm:text-xs text-2xs">
					You havent set up any tags. Hint: go to your profile :)
				</div>
				<div
					v-else-if="recommendedCourses?.length == 0"
					class="text-neutral-200 w-full h-full grid place-items-center sm:text-xs text-2xs">
					We couldnt find any recommendations
				</div>
			</Card>
		</div>
	</div>
</template>
