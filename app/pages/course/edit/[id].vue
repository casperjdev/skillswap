<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { marked } from 'marked';
import type { Course, Lesson } from '~/types/strapi/courses';

definePageMeta({
  layout: 'course-edit',
});

const route = useRoute();
const courseId = route.params.id as string;
const saving = ref(false);
const initialLoading = ref(true);

// State
const courseData = ref<Course | null>(null);
const lessons = ref<Lesson[]>([]);

// Editor State
const lessonName = ref('');
const content = ref('');
const selectedLessonId = ref<string | number>('');

// Video State (Just a URL string now)
const videoUrl = ref('');

// UI Refs
const isMobileSettingsOpen = ref(false);
const activeTab = ref<'write' | 'preview'>('write');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showToast = ref(false);
const toastMessage = ref('Changes Saved');

// --- FETCHING ---
const fetchCourseData = async () => {
  try {
    // Let's grab the whole response first to be safe
    const response = await $fetch<any>(`/api/courses/${courseId}`);

    // Handle the Double Data Wrapper
    // We check if 'data' exists, and if it has a nested 'data' property
    const realCourseData = response.data?.data || response.data;

    if (realCourseData) {
      courseData.value = realCourseData;

      // Now we can safely access the lessons array
      lessons.value = realCourseData.lessons || [];

      console.log('Lessons loaded:', lessons.value.length); // Quick sanity check
      return true;
    }
  } catch (e) {
    console.error('Failed to load course', e);
    return false;
  }
  return false;
};

onMounted(async () => {
  if (!courseId || courseId === 'undefined') {
    navigateTo('/home');
    return;
  }

  const success = await fetchCourseData();
  if (success && lessons.value.length > 0) {
    const firstId = lessons.value[0].documentId || lessons.value[0].id;
    loadLesson(firstId);
  } else if (success) {
    createNewLesson();
  } else {
    navigateTo('/home');
  }

  initialLoading.value = false;
});

// --- LOGIC ---

const syncEditorToLessonsArray = () => {
  const idx = lessons.value.findIndex(l => l.id === selectedLessonId.value || l.documentId === selectedLessonId.value);
  if (idx !== -1) {
    lessons.value[idx].title = lessonName.value;
    lessons.value[idx].content = content.value;
    (lessons.value[idx] as any).videoUrl = videoUrl.value;
  }
};

const loadLesson = (id: string | number) => {
  if (selectedLessonId.value) {
    syncEditorToLessonsArray();
  }

  selectedLessonId.value = id;
  const lesson = lessons.value.find(l => l.id === id || l.documentId === id);

  if (lesson) {
    lessonName.value = lesson.title || '';

    // --- DECODER: Szukamy ukrytego linku w treści ---
    let rawContent = lesson.content || '';
    // Regex łapie <!-- video-url: https://youtube... -->
    const videoMatch = rawContent.match(/<!--\s*video-url:(.*?)\s*-->/);

    if (videoMatch && videoMatch[1]) {
      videoUrl.value = videoMatch[1].trim();
      // Czyścimy edytor z tego komentarza
      content.value = rawContent.replace(videoMatch[0], '').trim();
    } else {
      // Fallback do pamięci lub pusto
      videoUrl.value = (lesson as any).videoUrl || '';
      content.value = rawContent;
    }
  }
};

const createNewLesson = () => {
  syncEditorToLessonsArray();

  const tempId = Date.now();
  const newLesson: any = {
    id: tempId,
    documentId: `temp-${tempId}`,
    title: `Lesson ${lessons.value.length + 1}`,
    content: '# New Lesson\nStart creating...',
    videoUrl: '',
  };

  lessons.value.push(newLesson);
  loadLesson(tempId);
};

const saveCourse = async () => {
  syncEditorToLessonsArray();
  saving.value = true;

  try {
    // Prosty payload - wysyłamy po prostu string URL
    const payloadLessons = lessons.value.map(l => ({
      documentId: l.documentId,
      title: l.title,
      content: l.content,
      videoUrl: (l as any).videoUrl,
    }));

    const updatedCourse = await $fetch<{ data: Course }>(`/api/courses/${courseId}`, {
      method: 'PUT',
      body: { lessons: payloadLessons }
    });

    if (updatedCourse && updatedCourse.lessons) {
      const currentIndex = lessons.value.findIndex(l => l.documentId === selectedLessonId.value);
      lessons.value = updatedCourse.lessons;
      if (currentIndex !== -1 && lessons.value[currentIndex]) {
        const newLesson = lessons.value[currentIndex];
        selectedLessonId.value = newLesson.documentId || newLesson.id;
        loadLesson(selectedLessonId.value);
      }
    }

    toastMessage.value = 'Saved successfully';
    showToast.value = true;
    setTimeout(() => showToast.value = false, 2000);
  } catch (e: any) {
    console.error('Save failed', e);
    toastMessage.value = `Error: ${e.data?.statusMessage || e.message}`;
    showToast.value = true;
    setTimeout(() => showToast.value = false, 4000);
  } finally {
    saving.value = false;
  }
};

// --- UTILS ---
const insertFormat = async (prefix: string, suffix: string = '') => {
  const textarea = textareaRef.value;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const originalText = content.value;
  const selection = originalText.substring(start, end);
  const newText = originalText.substring(0, start) + prefix + selection + suffix + originalText.substring(end);
  content.value = newText;
  await nextTick();
  textarea.focus();
  const newCursorPos = start + prefix.length + selection.length + suffix.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
};

const formatBold = () => insertFormat('**', '**');
const formatItalic = () => insertFormat('*', '*');
const formatH2 = () => insertFormat('## ');
const formatH3 = () => insertFormat('### ');
const formatList = () => insertFormat('- ');
const formatCode = () => insertFormat('`', '`');
const formatBlockquote = () => insertFormat('> ');

const parsedContent = computed(() => marked.parse(content.value));

// Obsługa YouTube URL -> Embed
const embedUrl = computed(() => {
  if (!videoUrl.value) return null;

  // Wyciągamy ID z linku YouTube (obsługuje youtu.be, youtube.com/watch, embed)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = videoUrl.value.match(regExp);

  if (match && match[2]?.length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  return null; // Jeśli to nie YouTube, nie wyświetlamy iframe (bezpieczniej)
});
</script>

<template>
  <div v-if="initialLoading" class="h-screen w-full grid place-items-center bg-neutral-900 text-emerald-500">
    <Icon name="lucide:loader-2" class="animate-spin w-10 h-10" />
  </div>

  <Card v-else
        class="h-[100svh] md:h-[90svh] md:max-h-[950px] backdrop-blur-md bg-transparent md:rounded-2xl shadow-2xl shadow-black border border-neutral-800 flex flex-col overflow-hidden ring-1 ring-white/5 z-10">
    <header class="rounded-md border-b border-neutral-800 z-20 bg-neutral-900/50 md:bg-transparent">
      <button
          @click="isMobileSettingsOpen = !isMobileSettingsOpen"
          class="w-full flex items-center justify-between p-3 md:hidden text-xs font-bold text-neutral-400 hover:text-white transition-colors">
        <div class="flex items-center gap-2">
          <span class="truncate max-w-[200px]">{{ lessonName || 'Lesson Settings' }}</span>
        </div>
        <svg :class="['w-4 h-4 transition-transform duration-300', isMobileSettingsOpen ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      <div :class="['transition-all duration-300 overflow-hidden md:overflow-visible', isMobileSettingsOpen ? 'max-h-[500px] opacity-100 border-t border-neutral-800 md:border-t-0' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100']">
        <div class="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

          <div class="md:col-span-3 space-y-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">Lesson</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <select
                    :value="selectedLessonId"
                    @change="loadLesson(($event.target as HTMLSelectElement).value)"
                    class="w-full text-white bg-neutral-800 border border-neutral-700 text-xs rounded-lg py-2 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors hover:border-neutral-600 cursor-pointer">
                  <option v-for="(lesson, idx) in lessons" :key="lesson.documentId || lesson.id" :value="lesson.documentId || lesson.id">
                    {{ idx + 1 }}. {{ lesson.title }}
                  </option>
                </select>
              </div>
              <button @click="createNewLesson" type="button" class="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-emerald-500 rounded-lg w-9 flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            </div>
          </div>

          <div class="md:col-span-5 space-y-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">Title</label>
            <input v-model="lessonName" type="text" placeholder="Enter lesson title..." class="w-full border border-neutral-700 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors placeholder:text-neutral-600 hover:border-neutral-600" />
          </div>

          <div class="md:col-span-4 space-y-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">YouTube URL</label>
            <div class="relative">
              <input
                  v-model="videoUrl"
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  class="w-full border border-neutral-700 text-xs text-emerald-400 rounded-lg px-3 py-2 pl-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors font-mono hover:border-neutral-600 placeholder:text-neutral-600" />
              <div class="absolute left-2.5 top-2 text-neutral-600">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="md:col-span-12 mt-2">
            <button @click="saveCourse" :disabled="saving" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon v-if="saving" name="lucide:loader-2" class="animate-spin w-3 h-3" />
              {{ saving ? 'Saving...' : 'Save All Changes' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="border-b border-neutral-800 flex items-center justify-between px-2.5 max-md:overflow-x-scroll h-10 shrink-0">
      <div class="flex items-center gap-0.5">
        <button @click="formatBold" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400">B</button>
        <button @click="formatItalic" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 italic">I</button>
        <div class="w-px h-4 mx-1 shrink-0"></div>
        <button @click="formatList" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>
      <div class="flex rounded-lg p-0.5 md:hidden shrink-0 ml-2 border border-neutral-800">
        <button @click="activeTab = 'write'" :class="['px-2.5 py-1 text-[9px] font-bold uppercase', activeTab === 'write' ? 'bg-neutral-700 text-white' : 'text-neutral-500']">Edit</button>
        <button @click="activeTab = 'preview'" :class="['px-2.5 py-1 text-[9px] font-bold uppercase', activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-neutral-500']">Preview</button>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden relative">
      <div :class="['flex-col md:flex w-full md:w-1/2 h-full', activeTab === 'write' ? 'flex' : 'hidden']">
        <textarea ref="textareaRef" v-model="content" @input="syncEditorToLessonsArray" class="flex-1 w-full h-full bg-transparent text-neutral-100 p-5 resize-none outline-none font-mono text-[13px] leading-relaxed custom-scrollbar" placeholder="Start writing..."></textarea>
      </div>

      <div class="hidden md:block w-px h-full shrink-0"></div>

      <div :class="['w-full md:w-1/2 h-full overflow-y-auto custom-scrollbar', activeTab === 'preview' ? 'block' : 'hidden md:block']">
        <div class="max-w-3xl mx-auto p-5 md:p-8">
          <!-- Video Container -->
          <div v-if="embedUrl" class="mb-6 rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-neutral-800 aspect-video bg-black">
            <iframe :src="embedUrl" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>

          <article class="text-neutral-400 text-[13px] md:text-sm leading-6 font-sans [&_h1]:text-white [&_h1]:font-bold [&_h1]:text-2xl" v-html="parsedContent"></article>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="absolute bottom-5 left-1/2 -translate-x-1/2 bg-neutral-800 border border-emerald-500/30 text-white px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2 text-[10px] font-bold z-50">
      <span>{{ toastMessage }}</span>
    </div>
  </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; border-radius: 3px; }
</style>