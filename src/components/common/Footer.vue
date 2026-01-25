<script setup lang="ts">
import { useI18n } from "vue-i18n";

const currentYear = new Date().getFullYear();
const { t } = useI18n();
</script>

<template>
	<footer
		class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto"
	>
		<div class="max-w-5xl mx-auto px-4 md:px-8 py-6">
			<div class="flex flex-col md:flex-row justify-between items-center gap-4">
				<div
					class="text-sm text-slate-500 dark:text-slate-300 text-center md:text-left"
				>
					<span class="font-semibold text-slate-700 dark:text-slate-100">
						{{ t("common.appName") }}
					</span>
					&copy;
					{{ currentYear }}
				</div>

				<div
					class="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-300"
				>
					<span class="block sm:inline mt-1 sm:mt-0">
						{{ t("footer.madeBy") }}
						<a
							class="text-blue-600 dark:text-blue-300 hover:underline"
							href="https://henestrosa.dev"
						>
							henestrosa.dev
						</a>
						{{ t("footer.madeWith") }}
						<span class="text-red-500 animate-pulse">❤</span>
						{{ t("footer.and") }}
						<a
							href="https://vuejs.org/"
							target="_blank"
							class="text-green-600 dark:text-green-300 hover:underline"
						>
							{{ t("footer.vue") }}
						</a>
					</span>
				</div>
			</div>
		</div>
	</footer>
</template>
