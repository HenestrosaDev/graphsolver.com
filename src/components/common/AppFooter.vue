<script setup lang="ts">
import { useI18n } from "vue-i18n";

const currentYear = new Date().getFullYear();
const { t } = useI18n();
</script>

<template>
	<footer class="mt-auto border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
		<div class="mx-auto max-w-5xl px-4 py-6 md:px-8">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<div class="text-center text-sm text-slate-500 md:text-left dark:text-slate-300">
					<span class="font-semibold text-slate-700 dark:text-slate-100">
						{{ t("common.appName") }}
					</span>
					&copy;
					{{ currentYear }}
				</div>

				<div class="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-300">
					<span class="mt-1 block sm:mt-0 sm:inline">
						{{ t("footer.madeBy") }}
						<a
							class="text-blue-600 hover:underline dark:text-blue-300"
							href="https://henestrosa.dev"
						>
							henestrosa.dev
						</a>
						{{ t("footer.madeWith") }}
						<span class="animate-pulse text-red-500">❤</span>
						{{ t("footer.and") }}
						<a
							href="https://vuejs.org/"
							target="_blank"
							class="text-green-600 hover:underline dark:text-green-300"
						>
							{{ t("footer.vue") }}
						</a>
					</span>
				</div>
			</div>
		</div>
	</footer>
</template>
