<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
});

const config = useRuntimeConfig();

const { data: userData } = await useFetch('/api/auth/me');
const currentUserId = userData.value?.user?.id;

const { data: coursesData, pending } = await useFetch('/api/courses');

const myCourses = computed(() => {
  if (!coursesData.value?.res?.data || !currentUserId) return [];

  return coursesData.value.res.data.filter(course =>
      course.authors?.some(author => author.id === currentUserId)
  );
});

</script>

<template>
  <div class="h-[calc(100svh-128px)] flex flex-col items-center max-w-4xl gap-4 mx-auto px-4">
    <h1 class="text-neutral-50 font-extrabold text-2xl">Creator Dashboard</h1>

    <Card class="w-full backdrop-blur-sm bg-black/10! flex flex-col gap-4 flex-1 overflow-hidden">
      <div class="flex items-center justify-between">
        <h2 class="text-lg text-neutral-50 font-bold">Your Courses</h2>
        <NuxtLink to="/create/new">
          <Button size="sm">+ Create Course</Button>
        </NuxtLink>
      </div>
      <div class="flex-1 overflow-y-auto space-y-3">
        <!-- Loading State -->
        <div v-if="pending" class="flex items-center justify-center py-12">
          <p class="text-neutral-400">Loading your courses...</p>
        </div>
        <div v-else-if="myCourses.length === 0" class="flex flex-col items-center justify-center py-12 gap-3">
          <p class="text-neutral-400">You haven't created any courses yet.</p>
          <NuxtLink to="/create/new">
            <Button>Create Your First Course</Button>
          </NuxtLink>
        </div>
        <div
            v-for="course in myCourses"
            :key="course.documentId"
            class="flex gap-4 p-3 rounded-lg bg-neutral-900/50 hover:bg-neutral-900/70 transition-colors">
          <div class="flex-shrink-0 w-32 h-20 rounded overflow-hidden bg-neutral-800">
            <img
                v-if="course.cover"
                :src="useStrapiImage(course.cover.url)"
                :alt="course.title"
                class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-800"></div>
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <h3 class="font-semibold text-neutral-50 text-sm line-clamp-1 mb-1">
                {{ course.title }}
              </h3>
              <p class="text-xs text-neutral-400 line-clamp-2">
                {{ course.description }}
              </p>
            </div>
            <div v-if="course.tags && course.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
              <span
                  v-for="tag in course.tags.slice(0, 3)"
                  :key="tag.documentId"
                  class="text-2xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                {{ tag.label }}
              </span>
            </div>
          </div>
          <div class="flex-shrink-0 flex gap-2 items-center">
            <NuxtLink :to="`/course/edit/${course.documentId}`">
              <Button variant="outline" size="sm" class="text-xs">Edit</Button>
            </NuxtLink>
            <NuxtLink :to="`/course/view/${course.documentId}`">
              <Button size="sm" class="text-xs">View</Button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>