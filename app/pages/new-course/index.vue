<script setup lang="ts">
import { ref } from 'vue';
import bgImage from "~/assets/images/new-course.jpg";
import StepName from "~/components/courseWizard/StepName.vue";
import StepCoverImage from "~/components/courseWizard/StepCoverImage.vue";
import StepDescription from "~/components/courseWizard/StepDescription.vue";
import StepTags from "~/components/courseWizard/StepTags.vue";
import StepReview from "~/components/courseWizard/StepReview.vue"; // Import Review

definePageMeta({
  layout: 'default',
});

// State
const currentStep = ref(0);
const slideDirection = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const formData = ref({
  name: '',
  coverImage: null as File | null,
  coverImagePreview: null as string | null,
  description: '',
  tags: [] as string[],
});

// Total steps increased to 5 (0, 1, 2, 3, 4)
const totalSteps = 5;

// Navigation Handlers
const handleNext = () => {
  if (currentStep.value < totalSteps - 1) {
    slideDirection.value = 'next';
    setTimeout(() => {
      currentStep.value++;
      slideDirection.value = '';
    }, 300);
  }
};

const handleBack = () => {
  if (currentStep.value > 0) {
    slideDirection.value = 'back';
    setTimeout(() => {
      currentStep.value--;
      slideDirection.value = '';
    }, 300);
  }
};

// Form Submission Handler
async function handleCreateCourse() {
  // Double check we are on the last step just in case
  if (currentStep.value !== totalSteps - 1) return;

  loading.value = true;
  error.value = null;

  try {
    // Simulate API call - replace this with your actual endpoint logic
    // await $fetch('/api/courses', { method: 'POST', body: formData.value })

    console.log("Sending data to server...", formData.value);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

    // Success logic (redirect, toast, etc.)
    console.log("Course created successfully!");

  } catch (err: any) {
    error.value = err?.data?.message || 'Failed to create course. Try again.';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="h-screen w-screen flex lg:flex-row flex-col gap-2 mx-auto overflow-hidden" :style="{ backgroundImage: `url(${bgImage})` }">
    <div class="h-full w-full justify-center items-center flex flex-col gap-2 px-4 py-6 lg:px-0 lg:py-0">
      <Card additional-classes="flex flex-col w-full sm:w-max sm:min-w-sm max-w-xl bg-black/40! text-neutral-950/10! backdrop-blur-sm">

        <form @submit.prevent="handleCreateCourse" class="w-full flex flex-col h-full">

          <div class="relative pb-4 w-full flex-grow">
            <StepName
                v-show="currentStep === 0"
                v-model="formData.name"
                :slide-direction="slideDirection"
                :is-active="currentStep === 0"
            />

            <StepCoverImage
                v-show="currentStep === 1"
                v-model:cover-image="formData.coverImage"
                v-model:cover-image-preview="formData.coverImagePreview"
                :slide-direction="slideDirection"
                :is-active="currentStep === 1"
            />

            <StepDescription
                v-show="currentStep === 2"
                v-model="formData.description"
                :slide-direction="slideDirection"
                :is-active="currentStep === 2"
            />

            <StepTags
                v-show="currentStep === 3"
                v-model="formData.tags"
                :slide-direction="slideDirection"
                :is-active="currentStep === 3"
            />

            <StepReview
                v-show="currentStep === 4"
                :form-data="formData"
                :slide-direction="slideDirection"
                :is-active="currentStep === 4"
            />
          </div>

          <div v-if="error" class="px-6 pb-2 text-center">
            <p class="text-red-400 text-xs sm:text-sm bg-red-900/20 py-1 px-2 rounded border border-red-500/30">
              {{ error }}
            </p>
          </div>

          <div class="px-4 sm:px-6 pb-4 mt-auto">
            <div class="flex items-center justify-center gap-2 mb-4">
              <div
                  v-for="index in totalSteps"
                  :key="index"
                  class="h-2 rounded-full transition-all duration-300"
                  :class="
                  index - 1 === currentStep
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40'
                "
              />
            </div>

            <div class="w-full flex items-center justify-around gap-4">
              <Button
                  type="button"
                  variant="clear"
                  @click="handleBack"
                  :disabled="currentStep === 0 || loading"
                  :class="{ 'opacity-40 cursor-not-allowed': currentStep === 0 || loading }"
                  class="text-sm sm:text-base w-32"
              >
                Back
              </Button>

              <Button
                  v-if="currentStep < totalSteps - 1"
                  type="button"
                  variant="solid"
                  @click="handleNext"
                  class="text-sm sm:text-base w-32"
              >
                Next
              </Button>

              <Button
                  v-else
                  type="submit"
                  variant="solid"
                  :disabled="loading"
                  class="text-sm sm:text-base w-32 relative"
              >
                <span v-if="!loading">Confirm</span>
                <Icon v-else name="lucide:loader-2" class="animate-spin w-5 h-5" />
              </Button>
            </div>
          </div>

        </form>
      </Card>
    </div>
  </main>
</template>

<style scoped>
main {
  background-size: cover;
  background-position: center;
}
</style>