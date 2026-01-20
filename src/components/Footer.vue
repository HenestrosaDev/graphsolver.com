<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-white border-t border-slate-200 mt-auto">
    <div class="max-w-5xl mx-auto px-4 md:px-8 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div class="text-sm text-slate-500 text-center md:text-left">
          <span class="font-semibold text-slate-700">GraphSolver Pro</span> &copy; {{ currentYear }}
          <span class="hidden sm:inline text-slate-300 mx-2">|</span>
          <span class="block sm:inline mt-1 sm:mt-0">Hecho por <a class="text-blue-600 hover:underline" href="https://henestrosa.dev">henestrosa.dev</a></span>
        </div>

        <div class="flex items-center gap-4 text-sm font-medium text-slate-500">
          <a href="#" class="hover:text-blue-600 transition-colors">Ayuda</a>
          <a href="https://github.com" target="_blank" class="hover:text-blue-600 transition-colors">GitHub</a>
          
          <div class="hidden sm:block h-4 w-px bg-slate-300"></div>
          
          <span class="flex items-center gap-1.5 opacity-80">
            Hecho con <span class="text-red-500 animate-pulse">❤</span> y
            <a href="https://vuejs.org/" target="_blank" class="text-green-600 hover:underline">Vue 3</a>
          </span>
        </div>

      </div>
    </div>
  </footer>
</template>