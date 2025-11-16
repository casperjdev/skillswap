<script setup lang="ts">
type Props = {
	text: string;
	variant?: 'solid' | 'clear';
	additionalClasses?: string;
};

const { text, variant = 'solid' } = defineProps<Props>();
</script>

<template>
	<button
		:class="[
			additionalClasses,
			variant === 'solid'
				? 'bg-neutral-50 text-neutral-950 hover:bg-neutral-400'
				: ' text-neutral-50 hover:text-neutral-400',
			'px-2 py-0.5 rounded-full text-2xs w-max h-max border border-neutral-50 hover:border-neutral-400 hover:drop-shadow-2xl transition-colors cursor-pointer',
		]">
		{{ text }}
	</button>
</template>
