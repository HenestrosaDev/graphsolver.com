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
		class="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition shadow-sm"
	>
		<span>{{ locale === "es" ? $t('language.es') : $t('language.en') }}</span>
	</button>
</template>
