<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { marked } from 'marked';

definePageMeta({
  layout: 'course-edit',
});

const lessons = [
  { id: 'intro', label: '1. Introduction' },
  { id: 'fundamentals', label: '2. Fundamentals' },
  { id: 'advanced', label: '3. Advanced Concepts' },
  { id: 'practical', label: '4. Practical Application' },
  { id: 'assessment', label: '5. Assessment & Review' },
];

const lessonName = ref('');
const videoLink = ref('');
const selectedLesson = ref('intro');
const content = ref('# Introduction to Course Development\n\nWelcome to the course creation platform. Use this editor to structure your educational content.\n\n## Learning Objectives\n- Define clear learning outcomes\n- Structure content effectively\n- Engage students with multimedia\n\n> "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela\n\nAdd your video link above to embed instructional content!');
const isMobileSettingsOpen = ref(false);
const activeTab = ref<'write' | 'preview'>('write');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showToast = ref(false);

let toastTimeout: any;

watch([lessonName, videoLink, selectedLesson, content], () => {
  showToast.value = true;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { showToast.value = false }, 1000);
}, { deep: true });

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
  const cursorOffset = selection.length === 0 ? -suffix.length : 0;
  textarea.setSelectionRange(newCursorPos + cursorOffset, newCursorPos + cursorOffset);
};

const formatBold = () => insertFormat('**', '**');
const formatItalic = () => insertFormat('*', '*');
const formatH2 = () => insertFormat('## ');
const formatH3 = () => insertFormat('### ');
const formatList = () => insertFormat('- ');
const formatCode = () => insertFormat('`', '`');
const formatBlockquote = () => insertFormat('> ');

const parsedContent = computed(() => marked.parse(content.value));

const embedUrl = computed(() => {
  if (!videoLink.value) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = videoLink.value.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
});
</script>

<template>
  <Card class="h-[100svh] md:h-[90svh] md:max-h-[950px] backdrop-blur-md bg-transparent md:rounded-2xl shadow-2xl shadow-black border border-neutral-800 flex flex-col overflow-hidden ring-1 ring-white/5 z-10">

    <header class="rounded-md border-b border-neutral-800 z-20 bg-neutral-900/50 md:bg-transparent">
      <button
          @click="isMobileSettingsOpen = !isMobileSettingsOpen"
          class="w-full flex items-center justify-between p-3 md:hidden text-xs font-bold text-neutral-400 hover:text-white transition-colors"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span class="truncate max-w-[200px]">{{ lessonName || 'Lesson Settings' }}</span>
        </div>
        <svg :class="['w-4 h-4 transition-transform duration-300', isMobileSettingsOpen ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      <div :class="[
          'transition-all duration-300 overflow-hidden md:overflow-visible',
          isMobileSettingsOpen ? 'max-h-[500px] opacity-100 border-t border-neutral-800 md:border-t-0' : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
        ]">
        <div class="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div class="md:col-span-3 space-y-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">Lesson</label>
            <div class="relative">
              <select v-model="selectedLesson" class="w-full text-white bg-neutral-800 border border-neutral-700 text-xs rounded-lg py-2 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors hover:border-neutral-600 cursor-pointer">
                <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">{{ lesson.label }}</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div class="md:col-span-5 space-y-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">Title</label>
            <input v-model="lessonName" type="text" placeholder="Enter lesson title..." class="w-full border border-neutral-700 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors placeholder:text-neutral-600 hover:border-neutral-600" />
          </div>

          <div class="md:col-span-4 space-y-1">
            <label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1">Video URL</label>
            <div class="relative">
              <input v-model="videoLink" type="text" placeholder="https://youtube.com/watch?v=..." class="w-full border border-neutral-700 text-xs text-emerald-400 rounded-lg px-3 py-2 pl-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors font-mono hover:border-neutral-600 placeholder:text-neutral-600" />
              <div class="absolute left-2.5 top-2 text-neutral-600">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="border-b border-neutral-800 flex items-center justify-between px-2.5 max-md:overflow-x-scroll h-10 shrink-0">
      <div class="flex items-center gap-0.5">
        <button @click="formatBold" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors text-xs font-bold" title="Bold">B</button>
        <button @click="formatItalic" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors italic font-serif text-xs" title="Italic">I</button>
        <div class="w-px h-4 mx-1 shrink-0"></div>
        <button @click="formatH2" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors text-[10px] font-bold" title="Heading 2">H2</button>
        <button @click="formatH3" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors text-[10px] font-bold" title="Heading 3">H3</button>
        <div class="w-px h-4 mx-1 shrink-0"></div>
        <button @click="formatList" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors" title="List">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <button @click="formatCode" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors font-mono text-xs" title="Code">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
        </button>
        <button @click="formatBlockquote" class="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-colors" title="Quote">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
        </button>
      </div>

      <div class="flex rounded-lg p-0.5 md:hidden shrink-0 ml-2 border border-neutral-800">
        <button @click="activeTab = 'write'" :class="['px-2.5 py-1 text-[9px] font-bold uppercase rounded-md transition-all', activeTab === 'write' ? 'bg-neutral-700 text-white' : 'text-neutral-500']">Edit</button>
        <button @click="activeTab = 'preview'" :class="['px-2.5 py-1 text-[9px] font-bold uppercase rounded-md transition-all', activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-neutral-500']">Preview</button>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden relative">
      <div :class="['flex-col md:flex w-full md:w-1/2 h-full transition-all', activeTab === 'write' ? 'flex' : 'hidden']">
        <textarea
            ref="textareaRef"
            v-model="content"
            class="flex-1 w-full h-full bg-transparent text-neutral-100 p-5 resize-none outline-none font-mono text-[13px] leading-relaxed placeholder:text-neutral-700 selection:bg-emerald-500/30 custom-scrollbar"
            placeholder="Write your course content here using Markdown formatting..."
            spellcheck="false"
        ></textarea>

        <div class="h-7 border-t border-neutral-800 text-[9px] text-neutral-500 px-4 flex items-center justify-between shrink-0">
          MARKDOWN EDITOR
          <span class="font-mono opacity-60">{{ content.length }} CHARACTERS</span>
        </div>
      </div>

      <div class="hidden md:block w-px h-full shrink-0"></div>

      <div :class="['w-full md:w-1/2 h-full overflow-y-auto custom-scrollbar', activeTab === 'preview' ? 'block' : 'hidden md:block']">
        <div class="max-w-3xl mx-auto p-5 md:p-8">
          <div v-if="embedUrl" class="mb-6 rounded-xl overflow-hidden shadow-lg shadow-black/50 border border-neutral-800 aspect-video">
            <iframe :src="embedUrl" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>

          <article
              class="
                text-neutral-400 text-[13px] md:text-sm leading-6 font-sans
                [&_h1]:text-xl md:[&_h1]:text-2xl [&_h1]:text-white [&_h1]:font-bold [&_h1]:mb-5 [&_h1]:tracking-tight
                [&_h2]:text-lg md:[&_h2]:text-xl [&_h2]:text-white [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-neutral-800
                [&_h3]:text-base [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                [&_p]:mb-3
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_li::marker]:text-emerald-500 [&_li]:mb-1
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li::marker]:text-emerald-500
                [&_a]:text-emerald-400 [&_a]:underline [&_a]:hover:text-emerald-300
                [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-500 [&_blockquote]:py-2 [&_blockquote]:px-3 [&_blockquote]:rounded-r [&_blockquote]:text-neutral-300 [&_blockquote]:italic [&_blockquote]:mb-5 [&_blockquote]:text-[13px]
                [&_code]:bg-emerald-500/10 [&_code]:text-emerald-400 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
                [&_pre]:bg-neutral-900 [&_pre]:border [&_pre]:border-neutral-800 [&_pre]:rounded-xl [&_pre]:p-3 [&_pre]:mb-5 [&_pre]:overflow-x-auto
                [&_pre_code]:bg-transparent [&_pre_code]:text-neutral-300 [&_pre_code]:p-0 [&_pre_code]:text-xs
                [&_strong]:text-white [&_strong]:font-bold
                [&_img]:rounded-xl [&_img]:border [&_img]:border-neutral-800 [&_img]:shadow-lg [&_img]:my-5
              "
              v-html="parsedContent"
          ></article>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="absolute bottom-5 left-1/2 -translate-x-1/2 bg-neutral-800 border border-emerald-500/30 text-white px-3.5 py-1.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2 text-[10px] font-bold z-50">
      <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      <span>Changes Saved</span>
    </div>

  </Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; border-radius: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #525252; }
</style>