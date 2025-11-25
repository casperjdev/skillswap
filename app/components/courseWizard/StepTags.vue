<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
	modelValue: string[];
	slideDirection: string;
	isActive: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:modelValue', value: string[]): void;
}>();

// Available tags from Strapi
const availableTags = ref<Array<{ id: number; label: string }>>([]);
const loadingTags = ref(true);
const tagsError = ref<string | null>(null);

// Fetch tags from Strapi
onMounted(async () => {
	try {
		loadingTags.value = true;

		const response = await $fetch<any>('/api/tags', { method: 'GET' });

		// Debug: always log the raw response so you can see the exact shape

		// Flexible mapping: handle different API shapes like:
		// { data: [...] } or { res: { data: [...] } } or { data: { data: [...] } } or plain [...]
		const maybeData = response?.data ?? response?.res?.data ?? response?.data?.data ?? response;

		// Normalize into simple array of { id, label }
		availableTags.value = (maybeData || [])
			.map((t: any) => ({
				id: t.id ?? t.documentId ?? t._id ?? Math.random(),
				label: (t.label ?? t.attributes?.label ?? t.attributes?.name ?? '').toString(),
			}))
			.filter((t: any) => t.label && t.label.length > 0);

		// Debug: show what the component will actually use
		('🏷️ Parsed available tags:', availableTags.value);
	} catch (err: any) {
		console.error('❌ Failed to load tags:', err);
		tagsError.value = 'Failed to load tags';
	} finally {
		loadingTags.value = false;
	}
});

const toggleTag = (label: string) => {
	const current = [...props.modelValue];
	const index = current.indexOf(label);

	if (index > -1) {
		// Remove tag
		current.splice(index, 1);
	} else {
		// Add tag
		current.push(label);
	}

	emit('update:modelValue', current);
};

const isSelected = (label: string) => {
	return props.modelValue.includes(label);
};
</script>

<template>
	<div
		:class="[
			'transition-all duration-300',
			slideDirection === 'next' && !isActive && '-translate-x-full opacity-0',
			slideDirection === 'back' && !isActive && 'translate-x-full opacity-0',
			isActive && 'translate-x-0 opacity-100',
		]">
		<div class="flex flex-col gap-4 px-6">
			<div>
				<h2 class="text-2xl font-semibold mb-1 text-white">Select Tags</h2>
				<p class="text-sm text-neutral-300">Choose tags that describe your course (optional)</p>
			</div>

			<div v-if="loadingTags" class="flex items-center justify-center py-8">
				<Icon name="lucide:loader-2" class="animate-spin w-6 h-6 text-white" />
			</div>

			<div v-else-if="tagsError" class="text-red-400 text-sm">
				{{ tagsError }}
			</div>

			<div v-else-if="availableTags.length === 0" class="text-neutral-400 text-sm">
				No tags available. Contact admin to create tags.
			</div>

			<div v-else class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2">
				<button
					v-for="tag in availableTags"
					:key="tag.id"
					type="button"
					@click="toggleTag(tag.label)"
					:class="[
						'px-3 py-1.5 capitalize rounded-full text-sm font-medium transition-all',
						'border-2 hover:scale-105 active:scale-95',
						isSelected(tag.label)
							? 'bg-white text-neutral-900 border-white'
							: 'bg-white/10 text-white border-white/30 hover:bg-white/20',
					]">
					<span class="flex items-center gap-1.5">
						<Icon v-if="isSelected(tag.label)" name="lucide:check" class="w-3 h-3" />
						{{ tag.label }}
					</span>
				</button>
			</div>

			<div v-if="modelValue.length > 0" class="mt-2">
				<p class="text-xs text-neutral-400">
					{{ modelValue.length }} tag{{ modelValue.length !== 1 ? 's' : '' }} selected
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Custom scrollbar for tags container */
.overflow-y-auto::-webkit-scrollbar {
	width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.1);
	border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.3);
	border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.5);
}
</style>
