<script setup lang="ts">
definePageMeta({
	layout: 'mission',
});
//sandbox
</script>

<template>
	<main class="h-max text-white p-4 flex flex-col">
		<div class="flex items-center justify-between mb-6">
			<NuxtLink to="/">
				<Button class="block"> ← Powrót </Button>
			</NuxtLink>

			<NuxtLink to="/mission-en">
				<Button variant="clear" class="block"> 🌐 EN </Button>
			</NuxtLink>
		</div>

		<h1 class="xl:text-5xl sm:text-3xl text-xl font-extrabold tracking-tight mb-8">NASZA MISJA</h1>

		<section class="space-y-6 sm:text-xs text-2xs leading-loose">
			<p>
				<span class="font-semibold"
					>Naszą misją jest umożliwienie młodym ludziom dostępu do wiedzy, inspiracji i
					narzędzi,</span
				>
				które pozwolą im rozwijać się, tworzyć i brać aktywny udział w kształtowaniu przyszłości.
				Youth2Youth jest platformą zaprojektowaną przez młodych i dla młodych — bez barier
				finansowych, bez zbędnych ograniczeń.
			</p>

			<p>
				Wierzymy, że
				<span class="font-semibold"
					>edukacja powinna być darmowa, nowoczesna i dopasowana do użytkownika.</span
				>
				Dlatego łączymy lekcje, społeczność, rekomendacje i narzędzia AI, aby każdy mógł odkrywać
				swoje pasje we własnym tempie.
			</p>

			<p>Nasze podejście opiera się na trzech filarach:</p>

			<ul class="list-disc pl-6 space-y-2">
				<li>
					<span class="font-semibold">Równy dostęp do wiedzy</span> -> każdy może się rozwijać
					niezależnie od sytuacji.
				</li>
				<li>
					<span class="font-semibold">Technologia wspierająca rozwój</span> -> AI pomaga, nie
					zastępuje.
				</li>
				<li>
					<span class="font-semibold">Społeczność i współpraca</span> -> młodzi uczą młodych, tworzą
					razem.
				</li>
			</ul>

			<p>
				Chcemy, aby Youth2Youth było miejscem, które nie tylko uczy, ale
				<span class="font-semibold">motywuje, łączy i otwiera drzwi do nowych możliwości.</span>
			</p>

			<p class="font-extrabold sm:text-xl text-base text-center mt-6">
				Jesteśmy generacją, która tworzy przyszłość — Youth2Youth ma ją wzmacniać.
			</p>
		</section>
	</main>
</template>
