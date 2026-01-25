<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const toggleLanguage = () => {
	locale.value = locale.value === "es" ? "en" : "es";
};
</script>

<template>
	<button
		@click="toggleLanguage"
		class="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
	>
		<span>{{ locale === "es" ? "ES" : "EN" }}</span>
	</button>
</template>
