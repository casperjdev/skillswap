<script setup lang="ts">
import { ref, onMounted } from 'vue';

const y = ref(0);

onMounted(() => {
  const update = () => {
    y.value = window.scrollY;
  };
  window.addEventListener('scroll', update, { passive: true });
});
</script>

<template>
  <nav
      :class="[
      'w-full h-8 z-100 px-4 flex items-center text-neutral-200 transition-colors',
      y > 32 ? 'bg-neutral-950/50 backdrop-blur-xs fixed top-0' : 'bg-transparent absolute top-4',
    ]"
  >
    <div class="w-full max-w-2xl mx-auto flex flex-row justify-between items-center">
      <span
          class="block w-max font-extrabold italic text-xs text-transparent bg-linear-180 from-50% from-neutral-50 to-100% to-neutral-400 bg-clip-text"
      >
        youth2youth
      </span>

      <!-- Desktop -->
      <div class="hidden sm:flex flex-row gap-2 text-2xs">
        <NuxtLink to="/auth?mode=signin">
          <Button text="Sign In" variant="clear" />
        </NuxtLink>

        <NuxtLink to="/auth?mode=register">
          <Button text="Sign Up" variant="solid" />
        </NuxtLink>
      </div>

      <!-- Mobile -->
      <div class="flex sm:hidden flex-row gap-2 text-2xs">
        <NuxtLink to="/auth?mode=register">
          <Button text="Get Started" variant="solid" />
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
