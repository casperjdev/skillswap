<template>
	<main
		class="w-svw h-svh flex justify-center items-center bg-cover bg-center bg-fixed p-4 relative">
		<NuxtImg
			class="w-full h-svh absolute inset-0 object-cover object-center -z-100"
			src="/img/auth.jpg"
			fit="cover" />
		<slot />
	</main>
</template>
