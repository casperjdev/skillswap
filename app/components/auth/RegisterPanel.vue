<script setup lang="ts">
import { ref, computed } from 'vue';

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const password = ref("");

const isBeingWritten = computed(() => password.value.length >= 1);
const isLongEnough = computed(() => password.value.length >= 8);
const hasNumber = computed(() => /\d/.test(password.value));
const isStrong = computed(() => isLongEnough.value && hasNumber.value);

const emit = defineEmits<{(e: 'switch-mode'): void;}>();
</script>

<template>
  <div class="flex w-full h-full items-center justify-center p-2 md:mt-4 flex-col gap-3">

    <input
        type="email"
        name="email"
        placeholder="E-mail"
        id="email"
        class="w-4/5 h-8 rounded-md p-1 text-white font-light text-xs backdrop-blur-[1px] bg-white/5 border border-zinc-200/80"
    />

    <div class="relative w-4/5">
      <input
          v-model="password"
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

    <div
        v-if="isBeingWritten"
        class="w-4/5 text-xs font-light -mt-2"
        :class="isStrong ? 'text-green-400' : 'text-red-400'"
    >
      <span v-if="!isLongEnough">Has to be at least 8 characters.</span>
      <span v-else-if="!hasNumber">Has to include at least one number.</span>
    </div>

    <div class="relative w-4/5">
      <input
          :type="showConfirmPassword ? 'text' : 'password'"
          name="confirmPassword"
          placeholder="Confirm password"
          id="confirmPassword"
          class="w-full h-8 rounded-md p-1 pr-8 text-white font-light text-xs backdrop-blur-[1px] bg-white/5 border border-zinc-200/80"
      />

      <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute right-1 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xs"
      >
        {{ showConfirmPassword ? '🙈️' : '👁️' }}
      </button>
    </div>

    <!-- EULA -->
    <div class="eulagroup -mt-1 -mb-1">
      <input type="checkbox" name="eula" id="eula-register">
      <label
          class="text-white font-extralight text-[clamp(0.4rem,1vw,0.75rem)]"
          for="eula-register"
      >
        I agree to the <a class="underline underline-offset-2">Terms &amp; Conditions</a>
      </label>
    </div>

    <Button text="Register" variant="solid"></Button>

    <button
        class="text-white font-extralight text-2xs hover:cursor-pointer"
        type="button"
        @click="emit('switch-mode')"
    >
      Already have an account?
    </button>

  </div>
</template>
