<script setup lang="ts">
defineProps<{
	coverImage: File | null;
	coverImagePreview: string | null;
	slideDirection: string;
	isActive: boolean;
}>();

const emit = defineEmits<{
	'update:coverImage': [value: File | null];
	'update:coverImagePreview': [value: string | null];
}>();

const handleImageUpload = (e: Event) => {
	const target = e.target as HTMLInputElement;
	const file = target.files?.[0];
	if (file) {
		emit('update:coverImage', file);
		emit('update:coverImagePreview', URL.createObjectURL(file));
	}
};

const removeImage = () => {
	emit('update:coverImage', null);
	emit('update:coverImagePreview', null);
};
</script>

<template>
	<div
		class="text-neutral-50 flex flex-col items-center transition-all duration-300"
		:class="{
			'opacity-0 -translate-x-8': slideDirection === 'next' && isActive,
			'opacity-0 translate-x-8': slideDirection === 'back',
			'opacity-100 translate-x-0': slideDirection === '',
		}">
		<h3 class="text-2xs sm:text-xs font-extrabold mb-2 text-center">
			Next, let's add a cover image.
		</h3>
		<div class="w-full my-2">
			<div v-if="coverImagePreview" class="relative">
				<img
					:src="coverImagePreview"
					alt="Cover preview"
					class="w-full h-40 sm:h-48 object-cover rounded-md" />
				<button
					@click="removeImage"
					class="absolute top-2 right-2 bg-black/60 text-white p-2 sm:p-1 rounded-full hover:bg-black/80 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center">
					<Icon name="lucide:x" class="w-5 h-5 sm:w-4 sm:h-4" />
				</button>
			</div>
			<label
				v-else
				class="w-full h-40 sm:h-48 border-2 border-dashed border-white/40 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-white/60 transition-colors active:bg-white/5">
				<Icon name="lucide:upload" class="w-10 h-10 sm:w-8 sm:h-8 text-white/60 mb-2" />
				<span class="text-white/60 text-sm sm:text-base text-center px-4"
					>Click and upload a cover image</span
				>
				<input type="file" accept="image/*" @change="handleImageUpload" class="hidden" />
			</label>
		</div>
	</div>
</template>
