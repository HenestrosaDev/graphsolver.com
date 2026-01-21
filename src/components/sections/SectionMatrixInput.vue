<script setup lang="ts">
import { onMounted } from 'vue';
import { useGraph } from '../../composables/useGraph';

const { nodes, rawMatrix, numNodes, createGrid, clearMatrix } = useGraph();

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
              @click="numNodes > 2 ? numNodes-- : null"
              class="w-8 h-8 flex items-center justify-center bg-white border-r border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition active:bg-blue-50"
            >
              -
            </button>
            <input 
              type="number" 
              :value="numNodes" 
              readonly
              class="w-10 h-8 text-center text-sm font-bold text-slate-700 focus:outline-none focus:bg-white bg-slate-50 cursor-default"
            >
            <button 
              @click="numNodes < 26 ? numNodes++ : null"
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
        >
          <span class="hidden sm:inline">Vaciar</span>
        </button>
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
/* THE ADD ANIMATION 
   This works automatically. When Vue adds a new vertex, it creates
   new <th> and <td> elements. The browser sees the .animate-fade-in class
   and immediately runs this animation once.
*/
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(-5px); /* Subtle slide down effect */
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out backwards;
}

/* Standard Inputs */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>