<script setup lang="ts">
const route = useRoute();

let path = computed(() => {
	return route.path;
});

let menuOpen = ref(false);

function open() {
	menuOpen.value = true;
	if (document) {
		document.body.style.overflowY = 'hidden';
	}
}

function close() {
	menuOpen.value = false;
	if (document) {
		document.body.style.overflowY = '';
	}
}
</script>

<template>
	<nav class="w-full bg-neutral-950 pattern[-45deg] text-neutral-950/50 fixed top-0 left-0 z-100">
		<div class="w-full h-8 px-4 max-w-2xl mx-auto flex flex-row gap-4 items-center">
			<NuxtLink to="/home">
				<span
					class="block w-max font-extrabold italic text-xs text-transparent bg-linear-180 from-50% from-neutral-50 to-100% to-neutral-400 bg-clip-text">
					youth2youth
				</span>
			</NuxtLink>
			<!--  Desktop -->
			<div class="hidden text-2xs h-full text-neutral-50 md:flex flex-row">
				<NuxtLink
					to="/home"
					:class="[
						'h-full px-2 grid place-items-center cursor-pointer  transition-colors relative group',
						path == '/home' ? 'opacity-100' : 'opacity-50 hover:text-neutral-400',
					]">
					Home
					<div
						:class="[
							'absolute bottom-0 w-0 transition-[width] bg-neutral-50 h-0.5',
							path == '/home' ? 'w-full' : 'group-hover:w-1/2',
						]"></div>
				</NuxtLink>
				<NuxtLink
					to="/discover"
					:class="[
						'h-full px-2 grid place-items-center cursor-pointer transition-colors relative group',
						path == '/discover' ? 'opacity-100' : 'opacity-50 hover:text-neutral-400',
					]"
					>Discover
					<div
						:class="[
							'absolute bottom-0 w-0 transition-[width] bg-neutral-50 h-0.5',
							path == '/discover' ? 'w-full' : 'group-hover:w-1/2',
						]"></div>
				</NuxtLink>
				<NuxtLink
					to="/teachers"
					:class="[
						'h-full px-2 grid place-items-center cursor-pointer  transition-colors relative group',
						path == '/teachers' ? 'opacity-100' : 'opacity-50 hover:text-neutral-400',
					]"
					>Teachers
					<div
						:class="[
							'absolute bottom-0 w-0 transition-[width] bg-neutral-50 h-0.5',
							path == '/teachers' ? 'w-full' : 'group-hover:w-1/2',
						]"></div>
				</NuxtLink>
				<NuxtLink
					to="/create"
					:class="[
						'h-full px-2 grid place-items-center cursor-pointer transition-colors relative group',
						path == '/create' ? 'opacity-100' : 'opacity-50 hover:text-neutral-400',
					]"
					>Create
					<div
						:class="[
							'absolute bottom-0 w-0 transition-[width] bg-neutral-50 h-0.5',
							path == '/create' ? 'w-full' : 'group-hover:w-1/2',
						]"></div>
				</NuxtLink>
			</div>

			<button
				@click="open()"
				class="grid md:hidden place-items-center ml-auto text-neutral-50 hover:text-neutral-400 transition-colors cursor-pointer">
				<Icon name="lucide:menu" class="w-4 h-4" />
			</button>
			<NuxtLink
				to="/account"
				class="grid place-items-center md:ml-auto text-neutral-50 hover:text-neutral-400 transition-colors">
				<Icon name="lucide:circle-user" class="w-4 h-4" />
			</NuxtLink>
		</div>
		<Separator />
	</nav>
	<!-- Mobile -->
	<div
		class="block md:hidden fixed top-0 right-0 w-32 h-svh bg-black pattern-[45deg] text-neutral-950/50 z-300 border-l border-neutral-500 transition-transform"
		:class="[menuOpen ? 'translate-x-0' : 'translate-x-32']">
		<div class="flex flex-col gap-2 text-2xs text-neutral-50 p-2">
			<button
				class="block ml-auto cursor-pointer hover:text-neutral-400 transition-colors"
				@click="close()">
				<Icon name="lucide:x" class="w-4 h-4" />
			</button>
			<NuxtLink class="hover:text-neutral-400 transition-colors" to="/home">Home</NuxtLink>
			<NuxtLink class="hover:text-neutral-400 transition-colors" to="/discover">Discover</NuxtLink>
			<NuxtLink class="hover:text-neutral-400 transition-colors" to="/teachers">Teachers</NuxtLink>
			<NuxtLink class="hover:text-neutral-400 transition-colors" to="/create">Create</NuxtLink>
		</div>
	</div>
	<div
		v-show="menuOpen"
		class="fixed top-0 left-0 w-svw h-svh bg-neutral-950/50 backdrop-blur-sm z-200 pointer-events-none"></div>
</template>
