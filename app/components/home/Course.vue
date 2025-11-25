<script setup lang="ts">
import type { Course } from '~/types/strapi/courses';

type Props = {
	data: Course;
};

const { data } = defineProps<Props>();
</script>

<template>
	<NuxtLink class="w-full h-full" :to="`/course/view/${data.documentId}`">
		<Card class="w-full h-full relative overflow-hidden z-0 flex flex-col gap-1 justify-end">
			<img
				class="absolute top-0 left-0 w-full h-full -z-20 object-cover object-top mask-alpha mask-b-from-0 mask-b-to-100% opacity-75"
				v-if="data.cover?.formats?.thumbnail?.url"
				:src="useStrapiImage(data.cover.url)"
				provider="strapi" />

			<h1 class="text-neutral-50 text-xs font-extrabold">{{ data.title }}</h1>
			<p class="text-neutral-200 text-2xs">
				{{
					data.description.length > 50
						? data.description.substring(0, 100) + '...'
						: data.description
				}}
			</p>
			<div class="flex flex-row gap-2 flex-wrap">
				<span
					class="text-[12px] text-neutral-200 bg-white/20 px-2 py-0.5 rounded-md"
					v-if="data.tags && data.tags.length > 0"
					v-for="tag in data.tags"
					>{{ tag.label }}</span
				>
				<p v-else class="text-[12px] text-neutral-200 font-bold">No tags</p>
			</div>
		</Card>
	</NuxtLink>
</template>
