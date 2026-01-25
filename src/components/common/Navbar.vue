<script setup lang="ts">
import LanguageSelector from './LanguageSelector.vue';
import { IconBrandGithub, IconChartDots } from '@tabler/icons-vue';
</script>

<template>
  <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        
        <div class="flex items-center gap-3">
          <div class="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
            <IconChartDots class="size-6" />
          </div>
          <span class="text-xl font-bold text-slate-800 tracking-tight">
            GraphSolver <span class="text-blue-600">Pro</span>
          </span>
        </div>

        <div class="flex items-center gap-4">
          <a href="https://github.com" target="_blank" class="text-slate-400 hover:text-slate-800 transition hidden sm:block" title="Ver código en GitHub">
            <IconBrandGithub class="size-6" />
          </a>

          <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

          <LanguageSelector />
        </div>
      </div>
    </div>
  </nav>
</template>