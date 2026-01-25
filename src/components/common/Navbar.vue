<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LanguageSelector from "./LanguageSelector.vue";
import ThemeToggle from "./ThemeToggle.vue";
import { IconBrandGithub, IconChartDots } from "@tabler/icons-vue";

const { t } = useI18n();
</script>

<template>
	<nav
		class="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-slate-900/70"
	>
		<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center gap-3">
					<div class="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
						<IconChartDots class="size-6" />
					</div>
					<span
						class="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight"
					>
						GraphSolver
					</span>
				</div>

				<div class="flex items-center gap-5">
					<div class="flex items-center gap-3">
						<a
							href="https://github.com"
							target="_blank"
							class="text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-100 transition"
							:title="t('navbar.githubTitle')"
						>
							<IconBrandGithub class="size-6" />
						</a>
						<ThemeToggle />
					</div>

					<div>
						<LanguageSelector />
					</div>
				</div>
			</div>
		</div>
	</nav>
</template>
