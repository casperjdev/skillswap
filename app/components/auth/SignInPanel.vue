<script setup lang="ts">
import { ref } from 'vue';

const showPassword = ref(false);

const emit = defineEmits<{
  (e: 'switch-mode'): void;
}>();
</script>

<template>
  <div class="flex w-full h-full items-center justify-center p-2 md:mt-4 flex-col gap-4">
    <label for="email" class="sr-only">E-Mail</label>
    <input
        type="email"
        name="email"
        placeholder="E-mail"
        id="email"
        class="w-4/5 h-8 -mb-2 rounded-md p-1 text-white font-light text-xs backdrop-blur-[1px] bg-white/5 border border-zinc-200/80"
    />

    <label for="password" class="sr-only">Password</label>
    <div class="relative -mb-2 w-4/5">
      <input
          :type="showPassword ? 'text' : 'password'"
          name="password"
          placeholder="Password"
          id="password"
          class="w-full h-8 rounded-md p-1 pr-8 text-white font-light text-xs backdrop-blur-[1px] bg-white/5 border border-zinc-200/80"
      />

      <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-1 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xs"
      >
        {{ showPassword ? '🙈️' : '👁️' }}
      </button>
    </div>


    <Button text="Sign in" variant="solid" />

    <button
        class="text-white font-extralight text-2xs hover:cursor-pointer"
        type="button"
        @click="emit('switch-mode')"
    >
      No account yet?
    </button>

    <a class="-mt-4 text-white font-extralight text-2xs hover:cursor-pointer">
      Trouble logging in?
    </a>
  </div>
</template>
