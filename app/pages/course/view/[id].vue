<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { marked } from 'marked';
import type { Course, Lesson } from '~/types/strapi/courses';

definePageMeta({
  layout: 'default',
});

const route = useRoute();
const courseId = route.params.id as string;

// --- STATE ---
const router = useRouter();
const loading = ref(true);
const courseData = ref<Course | null>(null);
const lessons = ref<Lesson[]>([]);

// View Mode: 'details' = landing page, 'learning' = active lesson view
const viewMode = ref<'details' | 'learning'>('details');

// Learning State
const currentLessonIdx = ref(0);
const slideDirection = ref<'next' | 'prev'>('next');

// --- FETCHING (Reused your robust logic) ---
const fetchCourseData = async () => {
  try {
    const response = await $fetch<any>(`/api/courses/${courseId}`);
    const strapiResponse = response.res || response;
    const realCourseData = strapiResponse?.data || strapiResponse;

    if (realCourseData) {
      courseData.value = realCourseData;
      lessons.value = realCourseData.lessons || realCourseData.attributes?.lessons || [];
      return true;
    }
  } catch (e) {
    console.error('Failed to load course', e);
  }
  return false;
};

const author = computed(() => {
  return courseData.value?.authors?.[0] ?? null;
});

onMounted(async () => {
  if (!courseId) {
    return navigateTo('/home');
  }
  await fetchCourseData();
  loading.value = false;
});

// --- COMPUTED ---
const currentLesson = computed(() => lessons.value[currentLessonIdx.value]);

const progressPercent = computed(() => {
  if (lessons.value.length === 0) return 0;
  return Math.round(((currentLessonIdx.value + 1) / lessons.value.length) * 100);
});

// Parse Markdown Content
const parsedContent = computed(() => {
  if (!currentLesson.value?.content) return '';let content = currentLesson.value.content;
  content = content.replace(/<!--\s*videoUrl:.*?\s*-->/g, '');
  return marked.parse(content);
});

// Extract Video URL (Same logic as Editor)
const currentVideoEmbed = computed(() => {
  const lesson = currentLesson.value;
  if (!lesson) return null;

  // Check explicit field first, then regex in content
  let url = (lesson as any).videoUrl;

  if (!url && lesson.content) {
    const match = lesson.content.match(/<!--\s*videoUrl:(.*?)\s*-->/);
    if (match && match[1]) url = match[1].trim();
  }

  if (!url) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2]?.length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
});

// --- ACTIONS ---

const startCourse = () => {
  viewMode.value = 'learning';
  currentLessonIdx.value = 0;
};

const goToLesson = (index: number) => {
  if (index < 0 || index >= lessons.value.length) return;

  slideDirection.value = index > currentLessonIdx.value ? 'next' : 'prev';
  currentLessonIdx.value = index;

  // Scroll to top of content on change
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const nextLesson = () => goToLesson(currentLessonIdx.value + 1);
const prevLesson = () => goToLesson(currentLessonIdx.value - 1);
</script>

<template>
  <div class="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-emerald-500/30">
    <!-- MAIN CONTENT -->
    <div v-if="courseData">
      <!-- TRANSITION BETWEEN MODES -->
      <Transition name="fade-mode" mode="out-in">
        <!-- === VIEW 1: COURSE DETAILS === -->
        <div v-if="viewMode === 'details'" key="details" class="relative">
          <!-- Hero Background -->
          <div
              class="absolute inset-0 h-[80vh] overflow-hidden opacity-40 mask-gradient z-0 pointer-events-none">
            <!-- Fallback image or Course Image if you have it -->
            <img
                src="/img/new-course.jpg"
                alt="Course Cover"
                class="w-full h-full object-cover blur-sm scale-110" />
            <div
                class="absolute inset-0 bg-gradient-to-b from-neutral-950/0 via-neutral-950/80 to-neutral-950"></div>
          </div>

          <div class="relative z-10 container mx-auto px-4 py-4 max-w-4xl">
            <Button
                @click="navigateTo('/home')"
                class="mb-2 flex items-center gap-1 transition-colors">
              <Icon name="lucide:arrow-left" class="w-2 h-2" /> Back to Home
            </Button>

            <h1
                class="xl:text-3xl sm:text-3xl text-xl font-extrabold tracking-tight mb-4 leading-tight">
              {{ courseData.title || courseData.name }}
            </h1>

            <p class="sm:text-xs text-2xs text-neutral-400 leading-relaxed max-w-xl mb-4">
              {{ courseData.description || 'No description provided.' }}
            </p>

            <!-- Tags -->
            <div
                v-if="courseData.tags && courseData.tags.length"
                class="flex flex-wrap gap-2 mb-4">
							<span
                  v-for="tag in courseData.tags"
                  :key="tag.id || tag"
                  class="px-3 py-1 rounded-full bg-white/5 border border-white/10 sm:text-xs text-2xs font-bold text-neutral-300">
								#{{ tag.label || tag }}
							</span>
            </div>

            <div v-if="author" class="flex items-center gap-3 mb-6 text-neutral-400">
              <span class="text-sm font-medium">
                By <span class="text-white font-bold">{{ author.username || author.name || 'Unknown Author' }}</span>
              </span>
            </div>

            <!-- CTA -->
            <div class="flex flex-col-reverse items-start justify-center gap-2">
              <Button
                  @click="startCourse"
                  class="md:px-8 md:py-3 rounded-xl font-bold lg:text-lg! md:text-sm text-2xs shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all flex items-center gap-2 group">
                Start Learning
                <Icon
                    name="lucide:play-circle"
                    class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div class="sm:text-xs text-2xs text-neutral-500 font-medium">
                {{ lessons.length }} Lessons
              </div>
            </div>

            <!-- Lessons List Preview -->
            <div class="sm:mt-20 mt-8 border-t border-neutral-800 pt-4">
              <h3
                  class="sm:text-xs text-2xs font-bold uppercase tracking-wider text-neutral-500 mb-6">
                Course Syllabus
              </h3>
              <div class="space-y-3">
                <div
                    v-for="(lesson, idx) in lessons"
                    :key="idx"
                    class="p-2 rounded-lg bg-neutral-900/50 border border-neutral-800/50 flex items-center gap-2 text-neutral-400">
									<span
                      class="w-4 h-4 shrink-0 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">
										{{ idx + 1 }}
									</span>
                  <span class="font-medium sm:text-xs text-2xs text-neutral-300">{{
                      lesson.title
                    }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- === VIEW 2: ACTIVE LEARNING === -->
        <div v-else key="learning" class="flex flex-col h-screen overflow-hidden bg-neutral-950">
          <!-- Top Bar -->
          <header
              class="h-12 border-b border-neutral-800 flex items-center justify-between px-4 md:px-8 bg-neutral-900/30 backdrop-blur-md z-50">
            <button
                @click="viewMode = 'details'"
                class="text-neutral-500 flex items-center hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>

            <div class="flex flex-col items-center">
							<span class="text-[10px] font-bold uppercase tracking-widest text-emerald-500"
              >Lesson {{ currentLessonIdx + 1 }} of {{ lessons.length }}</span
              >
              <h2
                  class="text-sm md:text-base font-bold text-neutral-200 truncate max-w-[200px] md:max-w-md">
                {{ currentLesson?.title }}
              </h2>
            </div>

            <!-- Progress Circle or plain text -->
            <div class="w-8 h-8 flex items-center justify-center">
              <span class="text-xs font-bold text-neutral-500">{{ progressPercent }}%</span>
            </div>
          </header>

          <!-- Content Area -->
          <main class="flex-1 overflow-y-auto custom-scrollbar bg-neutral-950/30">
            <div class="max-w-3xl mx-auto">
              <Transition
                  :name="slideDirection === 'next' ? 'slide-left' : 'slide-right'"
                  mode="out-in">
                <div :key="currentLessonIdx" class="w-full px-4 md:px-8 py-6 md:py-10">
                  <!-- Video Embed -->
                  <div
                      v-if="currentVideoEmbed"
                      class="mb-8 md:mb-10 group">
                    <div class="rounded-xl md:rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-neutral-800/50 aspect-video bg-black ring-1 ring-white/5 transform transition-transform group-hover:scale-[1.01]">
                      <iframe
                          :src="currentVideoEmbed"
                          class="w-full h-full"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen>
                      </iframe>
                    </div>
                  </div>

                  <!-- Markdown Content with Enhanced Styling -->
                  <article class="prose-custom" v-html="parsedContent"></article>

                  <!-- Empty State -->
                  <div v-if="!parsedContent && !currentVideoEmbed" class="flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center mb-4">
                      <svg class="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p class="text-neutral-500 text-sm font-medium">No content available for this lesson</p>
                  </div>
                </div>
              </Transition>
            </div>
          </main>

          <!-- Bottom Navigation Bar -->
          <footer
              class="h-14 md:h-16 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between z-50">
            <Button
                @click="prevLesson"
                :disabled="currentLessonIdx === 0"
                variant="clear"
                class="flex items-center gap-2 text-xs md:text-sm font-bold text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400 rounded-lg hover:bg-white/5 px-3 py-2">
              <Icon name="lucide:arrow-left" class="w-3 h-3 md:w-4 md:h-4" />
              <span class="hidden sm:inline">Previous</span>
            </Button>

            <div class="flex gap-1.5 mx-auto">
              <div
                  v-for="(_, idx) in lessons"
                  :key="idx"
                  class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  :class="
									idx === currentLessonIdx ? 'bg-emerald-500 scale-125' : 'bg-neutral-800'
								"></div>
            </div>

            <Button
                @click="currentLessonIdx === lessons.length - 1 ? router.push('/finished') : nextLesson()"
                class="flex items-center gap-2 text-xs md:text-sm font-bold text-black bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-30 disabled:bg-neutral-800 rounded-lg shadow-lg shadow-emerald-900/20 px-3 py-2">

              <span v-if="currentLessonIdx === lessons.length - 1">Finish</span>
              <span v-else class="hidden sm:inline">Next Lesson</span>

              <Icon name="lucide:arrow-right" class="w-3 h-3 md:w-4 md:h-4" />
            </Button>

          </footer>
        </div>
      </Transition>
    </div>

    <!-- NOT FOUND -->
    <div
        v-else
        class="h-screen w-full flex flex-col items-center justify-center text-neutral-500 gap-4">
      <h1 class="text-2xl font-bold text-white">Course Not Found</h1>
      <Button @click="navigateTo('/home')">Go Home</Button>
    </div>
  </div>
</template>

<style scoped>
/* Mask for hero image gradient */
.mask-gradient {
  mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #525252;
  background-clip: padding-box;
}

/* === ANIMATIONS === */

/* Fade Mode Switch */
.fade-mode-enter-active,
.fade-mode-leave-active {
  transition:
      opacity 0.4s ease,
      transform 0.4s ease;
}

.fade-mode-enter-from,
.fade-mode-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Slide Right (Next) */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

/* Moving Forward */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Moving Backward */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Enhanced Article Styling - Mobile First, Smaller Text */
.prose-custom {
  color: #d4d4d4;
  font-size: 0.875rem; /* 14px base for mobile */
  line-height: 1.7;
}

@media (min-width: 768px) {
  .prose-custom {
    font-size: 0.9375rem; /* 15px for tablet */
  }
}

@media (min-width: 1024px) {
  .prose-custom {
    font-size: 1rem; /* 16px for desktop */
  }
}

.prose-custom :deep(h1) {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.75rem; /* 28px mobile */
  margin-bottom: 1rem;
  margin-top: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.prose-custom :deep(h1:first-child) {
  margin-top: 0;
}

@media (min-width: 768px) {
  .prose-custom :deep(h1) {
    font-size: 2.25rem; /* 36px tablet */
    margin-bottom: 1.5rem;
    margin-top: 2rem;
  }
}

@media (min-width: 1024px) {
  .prose-custom :deep(h1) {
    font-size: 2.5rem; /* 40px desktop */
    margin-bottom: 1.5rem;
    margin-top: 2.5rem;
  }
}

.prose-custom :deep(h2) {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.375rem; /* 22px mobile */
  margin-bottom: 0.75rem;
  margin-top: 1.5rem;
  line-height: 1.3;
  border-bottom: 1px solid #262626;
  padding-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .prose-custom :deep(h2) {
    font-size: 1.5rem; /* 24px tablet */
    margin-bottom: 1rem;
    margin-top: 2rem;
    padding-bottom: 0.75rem;
  }
}

@media (min-width: 1024px) {
  .prose-custom :deep(h2) {
    font-size: 1.875rem; /* 30px desktop */
  }
}

.prose-custom :deep(h3) {
  color: #f5f5f5;
  font-weight: 600;
  font-size: 1.125rem; /* 18px mobile */
  margin-bottom: 0.5rem;
  margin-top: 1.25rem;
}

@media (min-width: 768px) {
  .prose-custom :deep(h3) {
    font-size: 1.25rem; /* 20px tablet */
    margin-bottom: 0.75rem;
    margin-top: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .prose-custom :deep(h3) {
    font-size: 1.5rem; /* 24px desktop */
  }
}

.prose-custom :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
  color: #d4d4d4;
}

@media (min-width: 768px) {
  .prose-custom :deep(p) {
    margin-bottom: 1.25rem;
    line-height: 1.75;
  }
}

.prose-custom :deep(strong) {
  color: #ffffff;
  font-weight: 600;
}

.prose-custom :deep(em) {
  color: #34d399;
  font-style: italic;
}

.prose-custom :deep(a) {
  color: #34d399;
  text-decoration: underline;
  text-decoration-color: rgba(52, 211, 153, 0.3);
  text-underline-offset: 2px;
  transition: text-decoration-color 0.2s;
}

.prose-custom :deep(a:hover) {
  text-decoration-color: #34d399;
}

.prose-custom :deep(ul), .prose-custom :deep(ol) {
  margin-bottom: 1rem;
  margin-left: 1.25rem;
}

@media (min-width: 768px) {
  .prose-custom :deep(ul), .prose-custom :deep(ol) {
    margin-bottom: 1.5rem;
    margin-left: 1.5rem;
  }
}

.prose-custom :deep(li) {
  line-height: 1.7;
  color: #d4d4d4;
  padding-left: 0.5rem;
  margin-bottom: 0.375rem;
}

@media (min-width: 768px) {
  .prose-custom :deep(li) {
    line-height: 1.75;
    margin-bottom: 0.5rem;
  }
}

.prose-custom :deep(ul li) {
  position: relative;
  list-style: none;
}

.prose-custom :deep(ul li::before) {
  content: '';
  position: absolute;
  left: -1.25rem;
  top: 0.55rem;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  background-color: #10b981;
}

.prose-custom :deep(code) {
  background-color: #262626;
  color: #34d399;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem; /* 13px mobile */
  font-family: ui-monospace, monospace;
  border: 1px solid #404040;
}

@media (min-width: 768px) {
  .prose-custom :deep(code) {
    font-size: 0.875rem; /* 14px desktop */
  }
}

.prose-custom :deep(pre) {
  background-color: #171717;
  border: 1px solid #262626;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .prose-custom :deep(pre) {
    border-radius: 0.75rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
}

.prose-custom :deep(pre code) {
  background-color: transparent;
  border: 0;
  padding: 0;
  color: #d4d4d4;
  font-size: 0.8125rem; /* 13px mobile */
}

@media (min-width: 768px) {
  .prose-custom :deep(pre code) {
    font-size: 0.875rem; /* 14px desktop */
  }
}

.prose-custom :deep(blockquote) {
  border-left: 3px solid #10b981;
  padding-left: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-style: italic;
  color: #a3a3a3;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent);
}

@media (min-width: 768px) {
  .prose-custom :deep(blockquote) {
    border-left-width: 4px;
    padding-left: 1.5rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.prose-custom :deep(hr) {
  border-color: #262626;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .prose-custom :deep(hr) {
    margin-top: 2.5rem;
    margin-bottom: 2.5rem;
  }
}

.prose-custom :deep(img) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid #262626;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .prose-custom :deep(img) {
    border-radius: 0.75rem;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.prose-custom :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem; /* 13px mobile */
}

@media (min-width: 768px) {
  .prose-custom :deep(table) {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem; /* 14px desktop */
  }
}

.prose-custom :deep(th) {
  background-color: #262626;
  color: #ffffff;
  font-weight: 600;
  padding: 0.5rem;
  text-align: left;
  border: 1px solid #404040;
}

@media (min-width: 768px) {
  .prose-custom :deep(th) {
    padding: 0.75rem;
  }
}

.prose-custom :deep(td) {
  padding: 0.5rem;
  border: 1px solid #262626;
  color: #d4d4d4;
}

@media (min-width: 768px) {
  .prose-custom :deep(td) {
    padding: 0.75rem;
  }
}
</style>