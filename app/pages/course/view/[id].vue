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
			// Handle Strapi quirks (attributes vs direct array)
			lessons.value = realCourseData.lessons || realCourseData.attributes?.lessons || [];
			return true;
		}
	} catch (e) {
		console.error('Failed to load course', e);
	}
	return false;
};

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
	if (!currentLesson.value?.content) return '';
	// Clean up any custom tags if needed, or just render
	let content = currentLesson.value.content;
	// Remove the video tag from text if it exists (since we render it separately)
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
							class="mb-8 flex items-center gap-1 transition-colors">
							<Icon name="lucide:arrow-left" class="w-2 h-2" /> Back to Home
						</Button>

						<h1
							class="xl:text-5xl sm:text-3xl text-xl font-extrabold tracking-tight mb-6 leading-tight">
							{{ courseData.title || courseData.name }}
						</h1>

						<p class="sm:text-xs text-2xs text-neutral-400 leading-relaxed max-w-2xl mb-8">
							{{ courseData.description || 'No description provided.' }}
						</p>

						<!-- Tags -->
						<div
							v-if="courseData.tags && courseData.tags.length"
							class="flex flex-wrap gap-2 mb-10">
							<span
								v-for="tag in courseData.tags"
								:key="tag.id || tag"
								class="px-3 py-1 rounded-full bg-white/5 border border-white/10 sm:text-xs text-2xs font-bold text-neutral-300">
								#{{ tag.label || tag }}
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
						<div class="mt-20 border-t border-neutral-800 pt-10">
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
					<main class="flex-1 overflow-y-auto custom-scrollbar">
						<div class="max-w-3xl mx-auto">
							<Transition
								:name="slideDirection === 'next' ? 'slide-left' : 'slide-right'"
								mode="out-in">
								<div :key="currentLessonIdx" class="w-full px-4 py-4">
									<!-- Video Embed -->
									<div
										v-if="currentVideoEmbed"
										class="mb-10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-neutral-800 aspect-video bg-black ring-1 ring-white/10">
										<iframe
											:src="currentVideoEmbed"
											class="w-full h-full"
											frameborder="0"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen>
										</iframe>
									</div>

									<!-- Markdown Content -->
									<article
										class="prose prose-invert prose-emerald max-w-none prose-p:text-neutral-400 prose-p:leading-relaxed prose-headings:text-white prose-headings:font-bold prose-xl prose-a:text-emerald-400 hover:prose-a:text-emerald-300 prose-code:text-emerald-300 prose-code:bg-emerald-900/20 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-img:rounded-xl prose-img:border prose-img:border-neutral-800"
										v-html="parsedContent"></article>
								</div>
							</Transition>
						</div>
					</main>

					<!-- Bottom Navigation Bar -->
					<footer
						class="h-10 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-md px-4 md:px-8 md:py-1 flex items-center justify-between z-50">
						<Button
							@click="prevLesson"
							:disabled="currentLessonIdx === 0"
							variant="clear"
							class="flex items-center gap-3 text-sm font-bold text-neutral-400 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-neutral-400 rounded-lg hover:bg-white/5">
							<Icon name="lucide:arrow-left" class="w-4 h-4" />
							Previous
						</Button>

						<div class="flex gap-1 mx-auto">
							<div
								v-for="(_, idx) in lessons"
								:key="idx"
								class="w-1.5 h-1.5 rounded-full transition-all duration-300"
								:class="
									idx === currentLessonIdx ? 'bg-emerald-500 scale-125' : 'bg-neutral-800'
								"></div>
						</div>

						<Button
							@click="nextLesson"
							:disabled="currentLessonIdx === lessons.length - 1"
							class="flex items-center gap-3 text-sm font-bold text-black bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-30 disabled:bg-neutral-800 rounded-lg shadow-lg shadow-emerald-900/20">
							<span v-if="currentLessonIdx === lessons.length - 1">Finish</span>
							<span v-else>Next Lesson</span>
							<Icon name="lucide:arrow-right" class="w-4 h-4" />
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
@import 'tailwindcss';
/* Mask for hero image gradient */
.mask-gradient {
	mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
	background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #404040;
	border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background: #525252;
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

article h1 {
	font-size: 128px;
}
</style>
