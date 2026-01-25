<script setup lang="ts">
import { useTheme } from '../../composables/useTheme';
import { IconSun, IconMoon } from '@tabler/icons-vue';

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors duration-200"
    :title="isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
  >
    <IconSun v-if="isDark" class="size-5" />
    <IconMoon v-else class="size-5" />
  </button>
</template>