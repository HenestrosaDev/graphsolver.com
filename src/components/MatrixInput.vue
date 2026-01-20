<script setup lang="ts">
import { onMounted } from 'vue';
import { useGraph } from '../composables/useGraph';

const { nodes, rawMatrix, numNodes, treatZeroAsNull, createGrid } = useGraph();

onMounted(() => {
  if (rawMatrix.value.length === 0) createGrid();
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    
    <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
      
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wide select-none">
          Vértices
        </span>
        <div class="flex items-center shadow-sm rounded-md overflow-hidden">
          <button 
            @click="numNodes > 2 ? numNodes-- : null"
            class="w-8 h-8 flex items-center justify-center bg-white border-r border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition active:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <input 
            type="number" 
            v-model.number="numNodes" 
            min="2" max="26"
            class="w-10 h-8 text-center text-sm font-bold text-slate-700 focus:outline-none focus:bg-white bg-slate-50"
          >
          <button 
            @click="numNodes < 26 ? numNodes++ : null"
            class="w-8 h-8 flex items-center justify-center bg-white border-l border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition active:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-4 sm:gap-6">
        
        <label class="flex items-center cursor-pointer select-none group">
          <input type="checkbox" v-model="treatZeroAsNull" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer">
          <span class="ml-2 text-sm text-slate-600 font-medium group-hover:text-slate-800 transition">
            0 = Sin conexión
          </span>
        </label>

        <div class="h-4 w-px bg-slate-300 hidden sm:block"></div>

        <span class="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden sm:inline-block">
          Vacío / -1 = ∞
        </span>
      </div>
    </div>
    
    <div class="p-4 sm:p-6 overflow-x-auto w-full flex justify-center bg-white">
      <table class="border-collapse table-fixed w-auto" v-if="rawMatrix.length">
        
        <colgroup>
          <col class="w-10 sm:w-12" />
          <col v-for="n in nodes" :key="'col-'+n" class="w-14 sm:w-16" />
        </colgroup>

        <thead>
          <tr>
            <th class="p-2 bg-slate-50 border border-slate-200 rounded-tl-lg"></th>
            <th v-for="node in nodes" :key="node" class="p-2 border border-slate-200 bg-slate-50 font-bold text-slate-600 text-xs sm:text-sm text-center select-none">
              {{ node }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rawMatrix" :key="i">
            <td class="p-2 bg-slate-50 border border-slate-200 font-bold text-center text-slate-600 text-xs sm:text-sm select-none">
              {{ nodes[i] }}
            </td>
            <td v-for="(_, j) in row" :key="j" class="p-0 border border-slate-200 text-center relative h-10 sm:h-11">
              <input 
                type="number" 
                v-model.number="rawMatrix[i][j]" 
                :disabled="i === j"
                placeholder="∞"
                :class="[
                  'w-full h-full text-center text-sm focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none transition font-medium',
                  i === j ? 'bg-slate-100 cursor-not-allowed text-transparent' : 'bg-white hover:bg-slate-50 text-slate-800 placeholder-slate-300'
                ]"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Eliminar flechas del input number */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>