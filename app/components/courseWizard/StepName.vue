<script setup lang="ts">
defineProps<{
	modelValue: string;
	slideDirection: string;
	isActive: boolean;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();
</script>

<template>
	<div
		class="text-neutral-50 flex flex-col items-center transition-all duration-300"
		:class="{
			'opacity-0 -translate-x-8': slideDirection === 'next' && isActive,
			'opacity-0 translate-x-8': slideDirection === 'back',
			'opacity-100 translate-x-0': slideDirection === '',
		}">
		<h3 class="text-2xs sm:text-xs font-extrabold mb-2 text-center">Let's start with the name.</h3>
		<input
			:value="modelValue"
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			type="text"
			placeholder="e.g. Photography 101"
			class="w-full rounded-md p-1 text-white font-light text-2xs backdrop-blur-[1px] bg-white/5 border border-neutral-200/80" />
	</div>
</template>
