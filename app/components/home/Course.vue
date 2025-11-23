<script setup lang="ts">
import type { Course } from '~/types/strapi/courses';

type Props = {
	data: Course;
};

const { data } = defineProps<Props>();
</script>

<template>
	<Card class="h-32 relative overflow-hidden z-0 flex flex-col justify-end">
		<NuxtImg
			class="absolute top-0 left-0 w-full h-full -z-20 object-cover object-top mask-alpha mask-b-from-0 mask-b-to-100% opacity-75"
			v-if="data.cover?.formats?.thumbnail?.url"
			:src="data.cover?.formats?.thumbnail?.url"
			provider="strapi" />

		<h1 class="text-neutral-50 text-xs font-extrabold">{{ data.title }}</h1>
		<p class="text-neutral-200 text-2xs">{{ data.description }}</p>
	</Card>
</template>
