<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const toggleLanguage = () => {
	locale.value = locale.value === "es" ? "en" : "es";
	localStorage.setItem("locale", locale.value);
};
</script>

<template>
	<button
		class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
		@click="toggleLanguage"
	>
		<span>{{ locale === "es" ? $t("language.en") : $t("language.es") }}</span>
	</button>
</template>
