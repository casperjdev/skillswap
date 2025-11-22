<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
	modelValue: string[];
	slideDirection: string;
	isActive: boolean;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
}>();

const currentTag = ref('');

const handleAddTag = (e: KeyboardEvent) => {
	if (e.key === 'Enter' && currentTag.value.trim()) {
		e.preventDefault();
		emit('update:modelValue', [...props.modelValue, currentTag.value.trim()]);
		currentTag.value = '';
	}
};

const removeTag = (indexToRemove: number) => {
	emit(
		'update:modelValue',
		props.modelValue.filter((_, index) => index !== indexToRemove)
	);
};
</script>

<template>
	<div
		class="text-neutral-50 flex flex-col items-center transition-all duration-300"
		:class="{
			'opacity-0 translate-x-8': slideDirection === 'back',
			'opacity-100 translate-x-0': slideDirection === '',
		}">
		<h3 class="text-2xs sm:text-xs font-extrabold mb-2 text-center">Add some tags.</h3>
		<div class="w-full my-2">
			<input
				v-model="currentTag"
				type="text"
				placeholder="Type a tag and press Enter"
				@keydown="handleAddTag"
				class="w-full rounded-md p-1 text-white font-light text-2xs backdrop-blur-[1px] bg-white/5 border border-neutral-200/80" />
			<div
				class="flex flex-nowrap overflow-x-scroll md:flex-wrap gap-2 mt-3 pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40">
				<span
					v-for="(tag, index) in modelValue"
					:key="index"
					class="bg-white/20 max-md:text-2xs text-white px-3 py-1.5 sm:py-1 rounded-full text-sm sm:text-base flex items-center gap-2 h-fit whitespace-nowrap shrink-0">
					{{ tag }}
					<button
						@click="removeTag(index)"
						class="hover:text-red-300 min-w-6 min-h-6 flex items-center justify-center">
						<Icon name="lucide:x" class="w-3.5 h-3.5 sm:w-3 sm:h-3" />
					</button>
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
	height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
	background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.4);
}

/* Firefox scrollbar */
.scrollbar-thin {
	scrollbar-width: thin;
	scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}
</style>
