<script setup lang="ts">
definePageMeta({
	layout: 'hero',
});
</script>

<template>
	<section class="w-full h-svh bg-neutral-950/50">
		<NuxtImg
			class="w-full h-svh absolute inset-0 object-cover object-center -z-100"
			src="/img/hero.jpg"
			fit="cover" />
		<div
			class="pattern-[-45deg] text-neutral-950/25 absolute top-0 left-0 md:w-1/2 md:mask-alpha md:mask-r-from-0% w-full h-svh -z-50"></div>
		<div
			class="absolute top-0 left-0 md:w-1/2 w-full h-svh md:pl-12 md:pr-0 px-4 py-8 flex flex-col justify-center gap-2 md:text-start text-center">
			<h1
				class="uppercase font-extrabold tracking-tight xl:text-5xl sm:text-3xl text-xl text-neutral-50">
				Together we are stronger.
			</h1>
			<p class="sm:text-xs text-2xs text-neutral-200">
				Youth2Youth is a platform where like-minded teenagers can exchange all types of knowledge -
				from hobbies to real life advice.
			</p>
			<div class="flex md:gap-2 md:flex-row flex-col md:justify-start justify-center items-center">
				<NuxtLink to="/auth?mode=signin">
					<Button variant="clear" additional-classes="px-4 py-1">Start Learning</Button>
				</NuxtLink>
				<NuxtLink to="/mission-en">
					<Button variant="solid" additional-classes="px-4 py-1">Our Mission</Button>
				</NuxtLink>
			</div>
		</div>
	</section>
	<Separator />
	<section class="pattern-thin-[90deg] text-neutral-950/50 bg-black md:px-12 px-4 py-8">
		<h1 class="text-center text-neutral-50 font-extrabold xl:text-base sm:text-sm text-xs">
			Trusted by teens and young adults worldwide
		</h1>
	</section>
	<Separator />
	<section class="flex flex-row justify-end relative pattern-thin-[-45deg] text-neutral-50/10">
		<div class="h-full w-full absolute -z-100">
			<NuxtImg
				src="/img/course_format.jpg"
				class="w-full h-full inset-0 object-cover object-center lg:mask-r-from-0% lg:mask-r-to-75% max-lg:opacity-50" />
		</div>
		<div class="md:px-12 px-4 py-16 flex flex-col gap-2 justify-center lg:max-w-1/2">
			<h1 class="xl:text-base sm:text-sm text-xs font-extrabold text-neutral-50">
				Free knowledge for those in need
			</h1>
			<p class="sm:text-xs text-2xs text-neutral-200">
				On Youth2Youth courses are 100% free and curated by the community. You can start discovering
				yourself more without hassle.
			</p>
		</div>
	</section>
	<Separator />
	<section class="flex flex-row justify-start relative pattern-thin-[45deg] text-neutral-50/10">
		<div class="h-full w-full absolute -z-100">
			<NuxtImg
				src="/img/entry.jpg"
				class="w-full h-full inset-0 object-cover object-center lg:mask-l-from-0% lg:mask-l-to-75% max-lg:opacity-50" />
		</div>
		<div class="md:px-12 px-4 py-16 flex flex-col gap-2 justify-center lg:max-w-1/2">
			<h1 class="xl:text-base sm:text-sm text-xs font-extrabold text-neutral-50">
				An easier entry into the real world
			</h1>
			<p class="sm:text-xs text-2xs text-neutral-200">
				Here you can prepare yourself by eudcating on concepts needed in the real world, one step at
				a time.
			</p>
		</div>
	</section>
	<Separator />
	<section class="flex flex-row justify-end relative pattern-thin-[-45deg] text-neutral-50/10">
		<div class="h-full w-full absolute -z-100">
			<NuxtImg
				src="/img/growth.jpg"
				class="w-full h-full inset-0 object-cover object-center lg:mask-r-from-0% lg:mask-r-to-75% max-lg:opacity-50" />
		</div>
		<div class="md:px-12 px-4 py-16 flex flex-col gap-2 justify-center lg:max-w-1/2">
			<h1 class="xl:text-base sm:text-sm text-xs font-extrabold text-neutral-50">
				Kickstart your growth
			</h1>
			<p class="sm:text-xs text-2xs text-neutral-200">
				With the help of a community of teens, students and young adults all over the world, you can
				learn how to start a stable life or career.
			</p>
		</div>
	</section>
</template>
