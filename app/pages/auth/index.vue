<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from '#imports';
import SignInPanel from '@/components/auth/SignInPanel.vue';
import RegisterPanel from '@/components/auth/RegisterPanel.vue';
import bgImage from '@/assets/images/auth.jpg';

const route = useRoute();
const router = useRouter();

const mode = ref<'signin' | 'register'>(route.query.mode === 'register' ? 'register' : 'signin');

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
		class="w-svw h-svh flex justify-center items-center bg-cover bg-center bg-fixed p-4"
		:style="{ backgroundImage: `url(${bgImage})` }">
		<!-- powrot -->

		<NuxtLink class="fixed top-4 left-4" to="/">
			<Button variant="solid" class="block">← Return</Button>
		</NuxtLink>

		<Card
			additional-classes="relative w-full max-w-xl bg-black/10! text-neutral-950/10! items-end backdrop-blur-sm flex md:flex-row flex-col-reverse gap-4">
			<!-- Left panel -->
			<div class="w-full md:absolute top-0 left-0 md:p-2 order-1">
				<span
					class="block w-full font-extrabold italic text-base md:text-start text-center text-transparent bg-linear-180 from-50% from-neutral-50 to-100% to-neutral-400 bg-clip-text">
					youth2youth
				</span>
				<h3 class="text-2xs text-neutral-200 md:text-start text-center">
					{{ mode === 'signin' ? 'Sign in' : 'Create an account' }}
				</h3>
			</div>

			<div
				class="md:flex-1 flex-0 flex w-full h-full max-md:items-center text-neutral-200 flex-col justify-between">
				<!-- TOP -->

				<!-- BOTTOM (OAuths) -->
				<div
					class="flex sm:flex-col flex-row gap-2 justify-end sm:w-full w-max mx-auto h-full flex-1">
					<Button
						variant="clear"
						class="w-full! flex flex-row justify-center gap-2 sm:px-4 px-0.5 py-1">
						<Icon name="cib:google" class="text-xs" />
						<p class="sm:block hidden">Continue with Google</p>
					</Button>
					<Button
						variant="solid"
						class="w-full! flex flex-row justify-center gap-2 sm:px-4 px-0.5 py-1">
						<Icon name="cib:facebook" class="text-xs" />
						<p class="sm:block hidden">Continue with Facebook</p>
					</Button>
				</div>
			</div>

			<!-- Right panel -->
			<div
				class="flex-1 flex w-full h-full flex-col gap-4 items-center bg-transparent justify-center overflow-hidden">
				<Transition name="slide-panel" mode="out-in">
					<SignInPanel v-if="mode === 'signin'" key="signin" @switch-mode="switchTo('register')" />
					<RegisterPanel v-else key="register" @switch-mode="switchTo('signin')" />
				</Transition>
			</div>
		</Card>
	</main>
</template>

<style scoped>
.container {
	background: linear-gradient(to bottom right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
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
