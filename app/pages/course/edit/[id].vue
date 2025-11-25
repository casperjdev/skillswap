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

// Video State
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
		const response = await $fetch<any>(`/api/courses/${courseId}`);
		('API Response structure:', response);
		const strapiResponse = response.res || response;
		const realCourseData = strapiResponse?.data || strapiResponse;

		if (realCourseData) {
			courseData.value = realCourseData;
			lessons.value = realCourseData.lessons || realCourseData.attributes?.lessons || [];
			('Lessons loaded:', lessons.value.length);
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
		('n1');
		navigateTo('/home');
		return;
	}

	const success = await fetchCourseData();
	success;
	if (success && lessons.value.length > 0) {
		const firstId = lessons.value[0].documentId || lessons.value[0].id;
		loadLesson(firstId);
	} else if (success) {
		createNewLesson();
	} else {
		('n2');
		navigateTo('/home');
	}

	initialLoading.value = false;
});

// --- LOGIC ---

const syncEditorToLessonsArray = () => {
	const idx = lessons.value.findIndex(
		(l) => l.id === selectedLessonId.value || l.documentId === selectedLessonId.value
	);
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
	const lesson = lessons.value.find((l) => l.id === id || l.documentId === id);

	if (lesson) {
		lessonName.value = lesson.title || '';

		let rawContent = lesson.content || '';
		const videoMatch = rawContent.match(/<!--\s*videoUrl:(.*?)\s*-->/);

		if (videoMatch && videoMatch[1]) {
			videoUrl.value = videoMatch[1].trim();
			content.value = rawContent.replace(videoMatch[0], '').trim();
		} else {
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
		const payloadLessons = lessons.value.map((l) => ({
			documentId: l.documentId,
			title: l.title,
			content: l.content,
			videoUrl: (l as any).videoUrl,
		}));

		const updatedCourse = await $fetch<{ data: Course }>(`/api/courses/${courseId}`, {
			method: 'PUT',
			body: { lessons: payloadLessons },
		});

		if (updatedCourse && updatedCourse.lessons) {
			const currentIndex = lessons.value.findIndex((l) => l.documentId === selectedLessonId.value);
			lessons.value = updatedCourse.lessons;
			if (currentIndex !== -1 && lessons.value[currentIndex]) {
				const newLesson = lessons.value[currentIndex];
				selectedLessonId.value = newLesson.documentId || newLesson.id;
				loadLesson(selectedLessonId.value);
			}
		}

		toastMessage.value = 'Saved successfully';
		showToast.value = true;
		setTimeout(() => (showToast.value = false), 2000);
	} catch (e: any) {
		console.error('Save failed', e);
		toastMessage.value = `Error: ${e.data?.statusMessage || e.message}`;
		showToast.value = true;
		setTimeout(() => (showToast.value = false), 4000);
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
	const newText =
		originalText.substring(0, start) + prefix + selection + suffix + originalText.substring(end);
	content.value = newText;
	await nextTick();
	textarea.focus();
	const newCursorPos = start + prefix.length + selection.length + suffix.length;
	textarea.setSelectionRange(newCursorPos, newCursorPos);
};

const formatBold = () => insertFormat('**', '**');
const formatItalic = () => insertFormat('*', '*');
const formatH2 = () => insertFormat('# ');
const formatH3 = () => insertFormat('## ');
const formatList = () => insertFormat('- ');
const formatCode = () => insertFormat('`', '`');
const formatBlockquote = () => insertFormat('> ');
const formatLink = () => insertFormat('[', '](url)');

const parsedContent = computed(() => marked.parse(content.value));

const embedUrl = computed(() => {
	if (!videoUrl.value) return null;
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = videoUrl.value.match(regExp);
	if (match && match[2]?.length === 11) {
		return `https://www.youtube.com/embed/${match[2]}`;
	}
	return null;
});

// Character and word count
const charCount = computed(() => content.value.length);
const wordCount = computed(
	() =>
		content.value
			.trim()
			.split(/\s+/)
			.filter((w) => w.length > 0).length
);
</script>

<template>
	<div
		v-if="initialLoading"
		class="h-screen w-full grid place-items-center bg-neutral-900 text-emerald-500">
		<Icon name="lucide:loader-2" class="animate-spin w-10 h-10" />
	</div>

	<Card
		v-else
		class="h-[100svh] md:h-[90svh] md:max-h-[950px] backdrop-blur-md bg-transparent md:rounded-2xl shadow-2xl shadow-black border border-neutral-800 flex flex-col overflow-hidden ring-1 ring-white/5 z-10">
		<header class="rounded-md border-b border-neutral-800 z-20 bg-neutral-900/50 md:bg-transparent">
			<button
				@click="isMobileSettingsOpen = !isMobileSettingsOpen"
				class="w-full flex items-center justify-between p-3 md:hidden text-xs font-bold text-neutral-400 hover:text-white transition-colors">
				<div class="flex items-center gap-2">
					<span class="truncate max-w-[200px]">{{ lessonName || 'Lesson Settings' }}</span>
				</div>
				<svg
					:class="[
						'w-4 h-4 transition-transform duration-300',
						isMobileSettingsOpen ? 'rotate-180' : '',
					]"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"></path>
				</svg>
			</button>

			<div
				:class="[
					'transition-all duration-300 overflow-hidden md:overflow-visible',
					isMobileSettingsOpen
						? 'max-h-[700px] opacity-100 border-t border-neutral-800 md:border-t-0'
						: 'max-h-0 opacity-0 md:max-h-none md:opacity-100',
				]">
				<div class="p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
					<div class="md:col-span-3 space-y-1">
						<label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1"
							>Lesson</label
						>
						<div class="flex gap-2">
							<div class="relative flex-1">
								<select
									:value="selectedLessonId"
									@change="loadLesson(($event.target as HTMLSelectElement).value)"
									class="w-full text-white bg-neutral-800 border border-neutral-700 text-xs rounded-lg py-2 pl-3 pr-8 appearance-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors hover:border-neutral-600 cursor-pointer">
									<option
										v-for="(lesson, idx) in lessons"
										:key="lesson.documentId || lesson.id"
										:value="lesson.documentId || lesson.id">
										{{ idx + 1 }}. {{ lesson.title }}
									</option>
								</select>
							</div>
							<button
								@click="createNewLesson"
								type="button"
								class="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-emerald-500 rounded-lg w-9 flex items-center justify-center transition-colors">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"></path>
								</svg>
							</button>
						</div>
					</div>

					<div class="md:col-span-5 space-y-1">
						<label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1"
							>Title</label
						>
						<input
							v-model="lessonName"
							type="text"
							placeholder="Enter lesson title..."
							class="w-full border border-neutral-700 text-xs text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors placeholder:text-neutral-600 hover:border-neutral-600" />
					</div>

					<div class="md:col-span-4 space-y-1">
						<label class="text-[9px] font-bold uppercase tracking-wider text-neutral-500 pl-1"
							>YouTube URL</label
						>
						<div class="relative">
							<input
								v-model="videoUrl"
								type="text"
								placeholder="https://youtube.com/watch?v=..."
								class="w-full border border-neutral-700 text-xs text-emerald-400 rounded-lg px-3 py-2 pl-8 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors font-mono hover:border-neutral-600 placeholder:text-neutral-600" />
							<div class="absolute left-2.5 top-2 text-neutral-600">
								<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
								</svg>
							</div>
						</div>
					</div>

					<div class="md:col-span-12 mt-2">
						<button
							@click="saveCourse"
							:disabled="saving"
							class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
							<Icon v-if="saving" name="lucide:loader-2" class="animate-spin w-3 h-3" />
							{{ saving ? 'Saving...' : 'Save All Changes' }}
						</button>
					</div>
				</div>
			</div>
		</header>

		<!-- Enhanced Toolbar -->
		<div
			class="border-b border-neutral-800 flex items-center justify-between px-3 py-2 shrink-0 bg-neutral-900/30 overflow-x-auto">
			<div class="flex items-center gap-1 min-w-max">
				<button
					@mousedown.prevent
					@click="formatBold"
					title="Bold (Ctrl+B)"
					class="group relative w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 font-bold text-sm transition-all active:scale-95">
					<span class="font-bold">B</span>
				</button>
				<button
					@mousedown.prevent
					@click="formatItalic"
					title="Italic (Ctrl+I)"
					class="group relative w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 italic font-serif text-sm transition-all active:scale-95">
					<span class="italic">I</span>
				</button>

				<div class="w-px h-5 bg-neutral-700 mx-1"></div>

				<button
					@mousedown.prevent
					@click="formatH2"
					title="Heading 1"
					class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 text-xs font-bold transition-all active:scale-95">
					H1
				</button>
				<button
					@mousedown.prevent
					@click="formatH3"
					title="Heading 2"
					class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 text-xs font-bold transition-all active:scale-95">
					H2
				</button>

				<div class="w-px h-5 bg-neutral-700 mx-1"></div>

				<button
					@mousedown.prevent
					@click="formatList"
					title="List"
					class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-all active:scale-95">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</button>

				<button
					@mousedown.prevent
					@click="formatCode"
					title="Code"
					class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-all active:scale-95">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
					</svg>
				</button>

				<button
					@mousedown.prevent
					@click="formatLink"
					title="Link"
					class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-all active:scale-95">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
					</svg>
				</button>

				<button
					@mousedown.prevent
					@click="formatBlockquote"
					title="Quote"
					class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-700 hover:text-emerald-400 transition-all active:scale-95">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
					</svg>
				</button>
			</div>

			<!-- Word Count & Tab Switcher -->
			<div class="flex items-center gap-3 ml-3 shrink-0">
				<div class="hidden sm:flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
					<span>{{ wordCount }} words</span>
					<span class="text-neutral-700">•</span>
					<span>{{ charCount }} chars</span>
				</div>

				<div class="flex rounded-lg p-0.5 md:hidden border border-neutral-700 bg-neutral-800/50">
					<button
						@click="activeTab = 'write'"
						:class="[
							'px-3 py-1.5 text-[10px] font-bold uppercase transition-all rounded',
							activeTab === 'write'
								? 'bg-neutral-700 text-white shadow-sm'
								: 'text-neutral-500 hover:text-neutral-300',
						]">
						Edit
					</button>
					<button
						@click="activeTab = 'preview'"
						:class="[
							'px-3 py-1.5 text-[10px] font-bold uppercase transition-all rounded',
							activeTab === 'preview'
								? 'bg-emerald-600 text-white shadow-sm'
								: 'text-neutral-500 hover:text-neutral-300',
						]">
						Preview
					</button>
				</div>
			</div>
		</div>

		<!-- Enhanced Editor & Preview -->
		<div class="flex-1 flex overflow-hidden relative bg-neutral-950/30">
			<!-- Editor Pane -->
			<div
				:class="[
					'flex-col md:flex w-full md:w-1/2 h-full relative',
					activeTab === 'write' ? 'flex' : 'hidden',
				]">
				<div
					class="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-neutral-900/20 to-transparent pointer-events-none z-10"></div>
				<textarea
					ref="textareaRef"
					v-model="content"
					@input="syncEditorToLessonsArray"
					class="flex-1 w-full h-full bg-transparent text-neutral-100 p-6 md:p-8 resize-none outline-none font-mono text-sm leading-loose custom-scrollbar selection:bg-emerald-500/30"
					placeholder="# Start writing your lesson here...

Use **Markdown** formatting to style your content.

- Create lists
- Add `code snippets`
- Insert > blockquotes

And much more!"
					spellcheck="true"></textarea>
			</div>

			<!-- Divider -->
			<div
				class="hidden md:block w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent h-full shrink-0"></div>

			<!-- Enhanced Preview Pane -->
			<div
				:class="[
					'w-full md:w-1/2 h-full overflow-y-auto custom-scrollbar bg-neutral-900/20',
					activeTab === 'preview' ? 'block' : 'hidden md:block',
				]">
				<div class="min-h-full">
					<div class="max-w-3xl mx-auto px-6 md:px-12 py-8 md:py-12">
						<!-- Video Embed -->
						<div v-if="embedUrl" class="mb-10 group">
							<div
								class="rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-neutral-800/50 aspect-video bg-black ring-1 ring-white/5 transform transition-transform group-hover:scale-[1.01]">
								<iframe
									:src="embedUrl"
									class="w-full h-full"
									frameborder="0"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen></iframe>
							</div>
						</div>

						<!-- Article Content -->
						<article class="prose-custom">
							<div v-html="parsedContent"></div>
						</article>

						<!-- Empty State -->
						<div
							v-if="!content.trim() && !embedUrl"
							class="flex flex-col items-center justify-center py-20 text-center">
							<div
								class="w-16 h-16 rounded-full bg-neutral-800/50 border border-neutral-700 flex items-center justify-center mb-4">
								<svg
									class="w-8 h-8 text-neutral-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
								</svg>
							</div>
							<p class="text-neutral-500 text-sm font-medium">
								Your content preview will appear here
							</p>
							<p class="text-neutral-600 text-xs mt-1">
								Start typing in the editor to see the magic ✨
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Toast Notification -->
		<Transition
			enter-active-class="transition-all duration-300 ease-out"
			enter-from-class="opacity-0 translate-y-2 scale-95"
			enter-to-class="opacity-100 translate-y-0 scale-100"
			leave-active-class="transition-all duration-200 ease-in"
			leave-from-class="opacity-100 translate-y-0 scale-100"
			leave-to-class="opacity-0 translate-y-2 scale-95">
			<div
				v-if="showToast"
				class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-800 border border-emerald-500/30 text-white px-5 py-2.5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center gap-2.5 text-xs font-semibold z-50 backdrop-blur-sm">
				<div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
				<span>{{ toastMessage }}</span>
			</div>
		</Transition>
	</Card>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
	width: 8px;
	height: 8px;
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

/* Enhanced Article Styling */
.prose-custom {
	color: #d4d4d4;
	font-size: 1rem;
	line-height: 1.75;
}

.prose-custom :deep(h1) {
	color: #ffffff;
	font-weight: 700;
	font-size: 2.25rem;
	margin-bottom: 1.5rem;
	margin-top: 2.5rem;
	line-height: 1.2;
	letter-spacing: -0.025em;
}

.prose-custom :deep(h1:first-child) {
	margin-top: 0;
}

@media (min-width: 768px) {
	.prose-custom :deep(h1) {
		font-size: 3rem;
	}
}

.prose-custom :deep(h2) {
	color: #ffffff;
	font-weight: 700;
	font-size: 1.5rem;
	margin-bottom: 1rem;
	margin-top: 2rem;
	line-height: 1.3;
	border-bottom: 1px solid #262626;
	padding-bottom: 0.75rem;
}

@media (min-width: 768px) {
	.prose-custom :deep(h2) {
		font-size: 1.875rem;
	}
}

.prose-custom :deep(h3) {
	color: #f5f5f5;
	font-weight: 600;
	font-size: 1.25rem;
	margin-bottom: 0.75rem;
	margin-top: 1.5rem;
}

@media (min-width: 768px) {
	.prose-custom :deep(h3) {
		font-size: 1.5rem;
	}
}

.prose-custom :deep(p) {
	margin-bottom: 1.25rem;
	line-height: 1.75;
	color: #d4d4d4;
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

.prose-custom :deep(ul),
.prose-custom :deep(ol) {
	margin-bottom: 1.5rem;
	margin-left: 1.5rem;
}

.prose-custom :deep(li) {
	line-height: 1.75;
	color: #d4d4d4;
	padding-left: 0.5rem;
	margin-bottom: 0.5rem;
}

.prose-custom :deep(ul li) {
	position: relative;
	list-style: none;
}

.prose-custom :deep(ul li::before) {
	content: '';
	position: absolute;
	left: -1.25rem;
	top: 0.6rem;
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
	font-size: 0.875rem;
	font-family: ui-monospace, monospace;
	border: 1px solid #404040;
}

.prose-custom :deep(pre) {
	background-color: #171717;
	border: 1px solid #262626;
	border-radius: 0.75rem;
	padding: 1.25rem;
	margin-bottom: 1.5rem;
	overflow-x: auto;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.prose-custom :deep(pre code) {
	background-color: transparent;
	border: 0;
	padding: 0;
	color: #d4d4d4;
}

.prose-custom :deep(blockquote) {
	border-left: 4px solid #10b981;
	padding-left: 1.5rem;
	padding-top: 0.25rem;
	padding-bottom: 0.25rem;
	margin-top: 1.5rem;
	margin-bottom: 1.5rem;
	font-style: italic;
	color: #a3a3a3;
	background: linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent);
}

.prose-custom :deep(hr) {
	border-color: #262626;
	margin-top: 2.5rem;
	margin-bottom: 2.5rem;
}

.prose-custom :deep(img) {
	border-radius: 0.75rem;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	border: 1px solid #262626;
	margin-top: 1.5rem;
	margin-bottom: 1.5rem;
}

.prose-custom :deep(table) {
	width: 100%;
	border-collapse: collapse;
	margin-top: 1.5rem;
	margin-bottom: 1.5rem;
	font-size: 0.875rem;
}

.prose-custom :deep(th) {
	background-color: #262626;
	color: #ffffff;
	font-weight: 600;
	padding: 0.75rem;
	text-align: left;
	border: 1px solid #404040;
}

.prose-custom :deep(td) {
	padding: 0.75rem;
	border: 1px solid #262626;
	color: #d4d4d4;
}
/* Mobile font-size tweaks — paste at the end of your existing <style scoped> */
@media (max-width: 767px) {
	/* Reduce base prose size so everything inside .prose-custom scales down */
	.prose-custom {
		font-size: 0.875rem; /* from 1rem -> smaller */
		line-height: 1.6;
	}

	/* Headings */
	.prose-custom :deep(h1) {
		font-size: 1.6rem; /* was 2.25rem (desktop) */
		margin-top: 1.25rem;
		margin-bottom: 1rem;
	}
	.prose-custom :deep(h2) {
		font-size: 1.125rem; /* was 1.5rem */
		margin-top: 1.25rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
	}
	.prose-custom :deep(h3) {
		font-size: 1rem; /* was 1.25rem */
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	/* Paragraphs and list items */
	.prose-custom :deep(p),
	.prose-custom :deep(li) {
		font-size: 0.875rem;
	}

	/* Code, pre and inline adjustments */
	.prose-custom :deep(code) {
		font-size: 0.8rem;
		padding: 0.08rem 0.28rem;
	}
	.prose-custom :deep(pre) {
		padding: 0.9rem;
		font-size: 0.8rem;
	}

	/* Smallen table text */
	.prose-custom :deep(th),
	.prose-custom :deep(td) {
		font-size: 0.78rem;
	}

	/* Textarea/editor font-size */
	textarea[ref='textareaRef'],
	textarea {
		font-size: 0.78rem !important; /* overrides text-sm -> smaller on mobile */
		line-height: 1.5;
		padding: 1rem;
	}

	/* UI tweaks: labels, inputs, buttons smaller */
	label,
	input,
	select,
	button {
		font-size: 0.72rem;
	}

	/* Tighten header/tab elements on mobile */
	.border-b .text-[10px],
	.flex .text-[10px] {
		font-size: 0.66rem;
	}

	/* Reduce toast size */
	.fixed[role] {
		/* generic selector fallback; if role not present, toast still targeted by earlier class */
		font-size: 0.75rem;
	}

	/* Optionally reduce spacing a bit to fit small screens */
	.p-6 {
		padding: 0.75rem;
	}
	.md\:p-8 {
		padding: 0.75rem;
	}
	.py-8 {
		padding-top: 1.25rem;
		padding-bottom: 1.25rem;
	}
}
</style>
