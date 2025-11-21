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
      class="text-neutral-50 flex flex-col items-center py-2 px-4 sm:px-6 transition-all duration-300"
      :class="{
      'opacity-0 -translate-x-8': slideDirection === 'next' && isActive,
      'opacity-0 translate-x-8': slideDirection === 'back',
      'opacity-100 translate-x-0': slideDirection === ''
    }"
  >
    <h3 class="max-md:hidden text-lg sm:text-xl mb-2 text-center">Tell us about your course.</h3>
    <textarea
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        placeholder="Describe what students will learn..."
        class="w-full h-32 py-2.5 sm:py-2 my-2 px-3 border border-white/40 rounded-md text-sm sm:text-base bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white/60 resize-none"
    />
  </div>
</template>