<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import SignInPanel from '@/components/auth/SignInPanel.vue';
import RegisterPanel from '@/components/auth/RegisterPanel.vue';
import bgImage from '@/assets/unsplash.jpg';

const route = useRoute();
const router = useRouter();

const mode = ref<'signin' | 'register'>(
    route.query.mode === 'register' ? 'register' : 'signin'
);

// reagujemy na zmiany URL
watch(
    () => route.query.mode,
    (value) => {
      if (value === 'signin' || value === 'register') {
        mode.value = value;
      }
    }
);

// funkcja zmieniająca tryb + URL
function switchTo(target: 'signin' | 'register') {
  router.push({ query: { mode: target } });
}
</script>
<template>
  <main
      class="w-screen h-screen flex justify-center items-center bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <div
        class="md:w-[70vw] md:h-[60vh] rounded-xl md:items-start items-center border text-black/30 backdrop-blur-sm border-white/10 bg-transparent pattern-[135deg] grid grid-cols-1 md:grid-cols-2 container"
    >
      <!-- Left panel -->
      <div class="flex w-full h-full max-md:items-center text-zinc-200 bg-transparent flex-col justify-between p-4">
        <!-- TOP -->
        <div>
          <h1 class="font-bold -mb-2 text-[clamp(1rem,3.5vw,3rem)]">Youth4Youth</h1>
          <h3 class="text-[clamp(0.5rem,2.5vw,3rem)]">
            {{ mode === 'signin' ? 'Sign in' : 'Create an account' }}
          </h3>
        </div>

        <!-- BOTTOM (OAuths) -->
        <div class="hidden md:flex flex-col gap-2 mb-2 justify-center">
          <button class="backdrop-blur-2xl w-[70%] border border-white/70 bg-white/10 px-3 py-1 rounded-md">
            Oauth placeholder
          </button>
          <button class="backdrop-blur-2xl w-[70%] border border-white/70 bg-white/10 px-3 py-1 rounded-md">
            Oauth placeholder
          </button>
          <button class="backdrop-blur-2xl w-[70%] border border-white/70 bg-white/10 px-3 py-1 rounded-md">
            Oauth placeholder
          </button>
        </div>
      </div>

      <!-- Right panel -->
      <div class="flex w-full h-full flex-col gap-4 items-center bg-transparent justify-center overflow-hidden">
        <Transition name="slide-panel" mode="out-in">
          <SignInPanel
              v-if="mode === 'signin'"
              key="signin"
              @switch-mode="switchTo('register')"
          />
          <RegisterPanel
              v-else
              key="register"
              @switch-mode="switchTo('signin')"
          />
        </Transition>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  background: linear-gradient(
      to bottom right,
      rgba(0, 0, 0, 0.8),
      rgba(0, 0, 0, 0.4)
  );
}

.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-panel-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-panel-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-panel-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-panel-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
