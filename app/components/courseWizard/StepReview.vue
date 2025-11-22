<script setup lang="ts">
defineProps<{
	formData: {
		name: string;
		coverImagePreview: string | null;
		description: string;
		tags: string[];
	};
	slideDirection: string;
	isActive: boolean;
}>();
</script>

<template>
	<div
		class="text-neutral-50 flex flex-col items-center transition-all duration-300 w-full"
		:class="{
			'opacity-0 -translate-x-8': slideDirection === 'next' && isActive,
			'opacity-0 translate-x-8': slideDirection === 'back',
			'opacity-100 translate-x-0': slideDirection === '',
		}">
		<h3 class="text-2xs sm:text-xs font-extrabold mb-4 text-center">Everything looks good?</h3>

		<div class="w-full space-y-3 overflow-y-auto max-h-[55vh] pr-1 scrollbar-thin">
			<div
				class="w-full aspect-video rounded-md overflow-hidden border border-white/40 bg-black/20 relative">
				<img
					v-if="formData.coverImagePreview"
					:src="formData.coverImagePreview"
					alt="Course Cover"
					class="w-full h-full object-cover" />
				<div v-else class="w-full h-full flex items-center justify-center text-white/40">
					<span class="text-sm italic">No cover image selected</span>
				</div>
			</div>

			<div class="space-y-1">
				<label class="text-xs text-white/60 uppercase tracking-wider font-bold ml-1"
					>Course Name</label
				>
				<div
					class="w-full py-2 px-3 border border-white/20 rounded-md text-sm sm:text-base bg-white/5 text-white/90 font-medium">
					{{ formData.name || 'Untitled Course' }}
				</div>
			</div>

			<div class="space-y-1">
				<label class="text-xs text-white/60 uppercase tracking-wider font-bold ml-1"
					>Description</label
				>
				<div
					class="w-full py-2 px-3 border border-white/20 rounded-md text-sm sm:text-base bg-white/5 text-white/90 whitespace-pre-wrap">
					{{ formData.description || 'No description provided.' }}
				</div>
			</div>

			<div class="space-y-1">
				<label class="text-xs text-white/60 uppercase tracking-wider font-bold ml-1">Tags</label>
				<div class="flex flex-wrap gap-2">
					<span
						v-for="(tag, index) in formData.tags"
						:key="index"
						class="bg-white/20 text-white px-3 py-1 rounded-full text-xs sm:text-sm border border-white/10">
						#{{ tag }}
					</span>
					<span v-if="formData.tags.length === 0" class="text-white/40 text-sm italic px-2">
						No tags added
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
	width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
	background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 3px;
}
</style>
