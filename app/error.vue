<script setup lang="ts">
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { useRouter, useRoute } from 'vue-router';

type Props = {
  error?: any;
  statusCode?: number;
  message?: string;
};

const props = defineProps<Props>();
const router = useRouter();
const route = useRoute();

const detectedStatusCode = props.error?.statusCode || props.statusCode || 500;
const detectedMessage = props.message || props.error?.message || props.error?.statusMessage;

const goHome = () => navigateTo('/');
const retry = () => navigateTo(route.fullPath);

const errorConfig: Record<number, { title: string; defaultMessage: string; icon: string }> = {
  400: {
    title: '400 Bad Request',
    defaultMessage: 'The request could not be understood by the server.',
    icon: '⚠️',
  },
  401: {
    title: '401 Unauthorized',
    defaultMessage: 'Authentication is required to access this resource.',
    icon: '🔒',
  },
  403: {
    title: '403 Forbidden',
    defaultMessage: 'You do not have permission to access this resource.',
    icon: '🚫',
  },
  404: {
    title: '404 Not Found',
    defaultMessage: 'The page you are looking for does not exist.',
    icon: '🔍',
  },
  500: {
    title: '500 Internal Server Error',
    defaultMessage: 'The server encountered an unexpected condition.',
    icon: '🔧',
  },
  503: {
    title: '503 Service Unavailable',
    defaultMessage: 'The server is temporarily unable to handle the request.',
    icon: '⏸️',
  },
};

const config = errorConfig[detectedStatusCode] || {
  title: `${detectedStatusCode} Error`,
  defaultMessage: 'An unexpected error occurred.',
  icon: '❌',
};

const displayMessage = detectedMessage || config.defaultMessage;
</script>

<template>
  <div class="min-h-screen flex items-center px-2 sm:px-4 md:px-16 py-8 justify-center bgtarget">
    <Card additionalClasses="max-w-lg w-full backdrop-blur-sm bg-black/50! text-neutral-950/10! flex flex-col">
      <div class="p-4 sm:p-6 flex flex-col items-center space-y-2 sm:space-y-6">
        <!-- Status Code -->
        <div class="text-center">
          <span class="text-5xl sm:text-6xl text-neutral-50/80 mb-4 sm:mb-6 block emoji">{{ config.icon }}</span>
          <h1 class="text-neutral-50 text-2xl sm:text-3xl font-bold">{{ config.title }}</h1>
        </div>

        <!-- Error Message -->
        <p class="text-neutral-400 text-center leading-relaxed text-sm sm:text-base px-2">
          {{ displayMessage }}
        </p>
      </div>
      <div class="p-4 sm:p-6 pt-0 flex flex-col w-full items-center justify-center space-y-2">
        <Button variant="clear" class="w-full sm:w-auto" @click="goHome">Go home</Button>
        <Button class="w-full sm:w-auto" @click="retry">Retry</Button>
      </div>
    </Card>
  </div>
</template>
<style scoped>
.bgtarget{
  background-image: url("@/assets/images/error.jpg");
  background-size: cover;
  background-position: center;
}
.emoji{
  filter:grayscale(100%);
}
</style>