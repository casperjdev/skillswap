<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { Course } from '~/types/strapi/courses';

definePageMeta({
  layout: 'default',
});

// --- STATE ---
const loading = ref(true);
const courseData = ref<Course | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const windowSize = ref({ width: 0, height: 0 });

// --- FETCHING ---
const fetchFinishedCourse = async () => {
  const recentCookie = useCookie('recentCourse');
  const lastCookie = useCookie('lastCourse');
  const courseId = recentCookie.value || lastCookie.value;

  if (!courseId) {
    loading.value = false;
    return;
  }

  try {
    const response = await $fetch<any>(`/api/courses/${courseId}`);
    const strapiResponse = response.res || response;
    const realCourseData = strapiResponse?.data || strapiResponse;

    if (realCourseData) {
      courseData.value = realCourseData;
    }
  } catch (e) {
    console.error('Failed to load course details', e);
  } finally {
    loading.value = false;
  }
};

// --- CONFETTI ENGINE ---
let animationFrameId: number;
const particles: Particle[] = [];
const colors = ['#10b981', '#34d399', '#ffffff', '#059669', '#fcd34d'];

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;

  constructor(x: number, y: number) {
    // Canvas scaling factor for high DPI screens
    const dpr = window.devicePixelRatio || 1;

    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    // Adjust speed for DPI
    const speed = (Math.random() * 15 + 5) * dpr;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - (10 * dpr);
    this.size = (Math.random() * 8 + 4) * dpr;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = 0;
    this.maxLife = Math.random() * 100 + 150;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.5 * (window.devicePixelRatio || 1); // Gravity
    this.vx *= 0.96;
    this.life++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = 1 - this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.size, this.size);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const startConfetti = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  const updateSize = () => {
    if (canvasRef.value) {
      const dpr = window.devicePixelRatio || 1;
      // Set actual size in memory (scaled to account for extra pixels)
      canvasRef.value.width = window.innerWidth * dpr;
      canvasRef.value.height = window.innerHeight * dpr;
      // Normalize coordinate system to use css pixels
      // (Optional: usually easier to just multiply values like in Particle class)

      windowSize.value = { width: window.innerWidth, height: window.innerHeight };
    }
  };

  window.addEventListener('resize', updateSize);
  updateSize();

  const dpr = window.devicePixelRatio || 1;

  // Burst function
  const createBurst = (x: number, y: number, count: number) => {
    // Adjust inputs to account for Canvas DPI scaling
    const canvasX = x * dpr;
    const canvasY = y * dpr;

    for (let i = 0; i < count; i++) {
      particles.push(new Particle(canvasX, canvasY));
    }
  };

  setTimeout(() => createBurst(window.innerWidth * 0.2, window.innerHeight * 0.7, 100), 100);
  setTimeout(() => createBurst(window.innerWidth * 0.8, window.innerHeight * 0.7, 100), 300);
  setTimeout(() => createBurst(window.innerWidth * 0.5, window.innerHeight * 0.5, 150), 600);

  const animate = () => {
    if (!canvasRef.value) return;
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life >= particles[i].maxLife) {
        particles.splice(i, 1);
      }
    }
    animationFrameId = requestAnimationFrame(animate);
  };

  animate();
};

onMounted(async () => {
  await fetchFinishedCourse();
  if (courseData.value) {
    startConfetti();
  }
});

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', () => {});
});

const getAuthorName = (c: Course) => c.authors?.[0]?.username || c.authors?.[0]?.name || 'The Team';
</script>

<template>
  <div class="relative min-h-[100dvh] bg-neutral-950 text-neutral-100 font-sans overflow-hidden flex flex-col items-center justify-center">

    <canvas
        ref="canvasRef"
        class="absolute inset-0 z-0 pointer-events-none w-full h-full"
    ></canvas>

    <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div class="absolute top-[-10%] left-[10%] w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-emerald-500/10 rounded-full blur-[80px] lg:blur-[120px] animate-pulse-slow"></div>
      <div class="absolute bottom-[-10%] right-[10%] w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-emerald-900/10 rounded-full blur-[60px] lg:blur-[100px]"></div>
    </div>

    <div class="relative z-10 w-full max-w-2xl px-4 lg:px-6 py-8 lg:py-12 text-center">

      <div v-if="loading" class="flex flex-col items-center gap-4 animate-pulse">
        <div class="w-16 h-16 rounded-full bg-neutral-800"></div>
        <div class="h-8 w-48 lg:w-64 bg-neutral-800 rounded"></div>
        <div class="h-4 w-32 lg:w-48 bg-neutral-800 rounded"></div>
      </div>

      <Transition
          appear
          enter-active-class="transition duration-1000 ease-out"
          enter-from-class="opacity-0 translate-y-10 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
      >
        <div v-if="!loading && courseData" class="flex flex-col items-center">

          <div class="mb-6 lg:mb-8 relative group">
            <div class="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div class="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-neutral-900 border-2 border-emerald-500/50 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
              <Icon name="lucide:trophy" class="w-10 h-10 lg:w-12 lg:h-12 text-emerald-400 drop-shadow-lg" />
            </div>
            <Icon name="lucide:star" class="absolute -top-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 text-yellow-400 animate-bounce delay-100 drop-shadow-lg" />
            <Icon name="lucide:star" class="absolute -bottom-1 -left-2 w-5 h-5 lg:w-6 lg:h-6 text-yellow-400 animate-bounce delay-300 drop-shadow-lg" />
          </div>

          <h1 class="text-xl lg:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Congratulations!
          </h1>
          <p class="text-neutral-400 text-base lg:text-lg lg:text-xl mb-8 lg:mb-10 max-w-xs lg:max-w-lg mx-auto">
            You just crushed it. Another milestone down.
          </p>

          <div class="w-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 p-4 lg:p-6 rounded-2xl shadow-xl transform transition-transform active:scale-95 lg:hover:scale-[1.02] duration-300 mb-8 lg:mb-10 text-left flex gap-3 lg:gap-5 items-center">

            <div class="shrink-0 max-lg:hidden w-16 h-16 lg:w-24 lg:h-24 rounded-xl bg-neutral-800 overflow-hidden border border-neutral-700 relative">
              <img
                  v-if="courseData.cover?.url"
                  :src="useStrapiImage(courseData.cover.url)"
                  class="w-full h-full object-cover"
                  alt="Course"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-600">
                <Icon name="lucide:book-open" class="w-6 h-6 lg:w-8 lg:h-8" />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex max-lg:justify-center items-center gap-2 mb-1">
                <span class="px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Completed
                </span>
                <span class="text-neutral-500 text-[10px] lg:text-xs font-medium">100% Completion</span>
              </div>
              <h2 class="text-2xs max-lg:text-center lg:text-xl font-bold text-white text-wrap mb-1">
                {{ courseData.title || courseData.name }}
              </h2>
              <p class="text-xs max-lg:text-center lg:text-sm text-neutral-400 truncate">
                By {{ getAuthorName(courseData) }}
              </p>
            </div>
          </div>

          <div class="flex max-lg:items-center flex-col lg:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
            <Button
                @click="navigateTo('/home')"
                class="w-full lg:w-auto order-2 lg:order-1 px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold transition-all border border-neutral-700"
            >
              Back to Courses
            </Button>

            <Button
                class="w-full lg:w-auto order-1 lg:order-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 group"
            >
              <Icon name="lucide:download" class="w-4 h-4 group-hover:scale-110 transition-transform" />
              Download Certificate
            </Button>
          </div>
        </div>

        <div v-else-if="!loading && !courseData" class="flex flex-col items-center text-neutral-500">
          <Icon name="lucide:ghost" class="w-16 h-16 mb-4 opacity-50" />
          <h2 class="text-xl font-bold text-neutral-300">No recent course found</h2>
          <p class="text-sm mb-6 px-4">Looks like you haven't finished a course recently.</p>
          <Button @click="navigateTo('/home')" class="bg-neutral-800 text-white px-6 py-2 rounded-lg">Browse Courses</Button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>