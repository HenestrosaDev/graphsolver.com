<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LanguageSelector from "./LanguageSelector.vue";
import ThemeToggle from "./ThemeToggle.vue";
import AppLogo from "./AppLogo.vue";
import { IconBrandGithub } from "@tabler/icons-vue";

const { t } = useI18n();
</script>

<template>
	<nav
		class="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-900/80 supports-[backdrop-filter]:dark:bg-slate-900/70"
	>
		<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<AppLogo logo-size="size-8" />

				<div class="flex items-center gap-5">
					<div class="flex items-center gap-3">
						<a
							href="https://github.com/henestrosadev/graphsolver.com"
							target="_blank"
							class="text-slate-400 transition hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-100"
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
