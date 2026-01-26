<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTheme } from "../../composables/useTheme";
import { IconSun, IconMoon } from "@tabler/icons-vue";

const { isDark, toggleTheme } = useTheme();
const { t } = useI18n();
</script>

<template>
	<button
		class="rounded-lg p-2 text-slate-400 duration-200 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
		:title="isDark ? t('theme.toLight') : t('theme.toDark')"
		@click="toggleTheme"
	>
		<IconSun
			v-if="isDark"
			class="size-6"
		/>
		<IconMoon
			v-else
			class="size-6"
		/>
	</button>
</template>
