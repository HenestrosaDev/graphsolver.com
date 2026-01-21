<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useGraph } from '../../composables/useGraph';

const { nodes, rawMatrix, numNodes: _numNodes, createGrid, clearMatrix } = useGraph();

// Handle validation
const numNodes = computed({
  get: () => _numNodes.value,
  set: (val: number) => {
    // If value is empty, NaN, or less than 2, force it to 2
    if (!val || val < 2) {
      _numNodes.value = 2;
    } 
    // Otherwise, accept the value
    else {
      _numNodes.value = val;
    }
  }
});

onMounted(() => {
  if (rawMatrix.value.length === 0) createGrid();
});
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
    <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wide select-none">
            Vértices
          </span>
          <div class="flex items-center shadow-sm rounded-md overflow-hidden">
            <button 
              @click="numNodes--" 
              class="w-8 h-8 flex items-center justify-center bg-white border-r border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition active:bg-blue-50"
            >
              -
            </button>

            <input 
              type="number" 
              v-model.number="numNodes" 
              @blur="numNodes < 2 ? numNodes = 2 : null"
              min="2"
              class="w-10 h-8 text-center text-sm font-bold text-slate-700 focus:outline-none focus:bg-white bg-slate-50"
            >

            <button 
              @click="numNodes++"
              class="w-8 h-8 flex items-center justify-center bg-white border-l border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition active:bg-blue-50"
            >
              +
            </button>
          </div>
        </div>

        <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <button 
          @click="clearMatrix"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-600 transition active:scale-95"
          title="Vaciar todos los valores de la matriz"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="hidden sm:inline">Vaciar</span>
        </button>
      </div>

      <div class="flex items-center gap-4 sm:gap-6">
        <span class="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden sm:inline-block">
          Vacío / -1 = ∞
        </span>
      </div>
    </div>
    
    <div class="p-4 sm:p-6 overflow-x-auto w-full flex justify-center bg-white">
      <table class="border-collapse table-fixed w-auto" v-if="rawMatrix.length">
        <thead>
          <tr>
            <th class="p-2 bg-slate-50 border border-slate-200 rounded-tl-lg"></th>
            <th 
              v-for="node in nodes" 
              :key="'head-'+node" 
              class="animate-fade-in p-2 border border-slate-200 bg-slate-50 font-bold text-slate-600 text-xs sm:text-sm text-center select-none w-14 sm:w-16"
            >
              {{ node }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rawMatrix" :key="'row-'+nodes[i]">
            <td class="p-2 bg-slate-50 border border-slate-200 font-bold text-center text-slate-600 text-xs sm:text-sm select-none">
              {{ nodes[i] }}
            </td>
            <td 
              v-for="(_, j) in row" 
              :key="'cell-'+i+'-'+j" 
              class="animate-fade-in p-0 border border-slate-200 text-center relative h-10 sm:h-11"
            >
              <input 
                type="number" 
                v-model.number="rawMatrix[i][j]" 
                :disabled="i === j"
                placeholder="∞"
                :class="[
                  'w-full h-full text-center text-sm focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none transition-colors font-medium',
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
/* Standard Inputs */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-out backwards;
}
</style>