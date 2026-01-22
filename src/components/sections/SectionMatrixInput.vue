<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useGraph } from '../../composables/useGraph';

const { generateRandomGraph, nodes, rawMatrix, numNodes: _numNodes, createGrid, clearMatrix } = useGraph();

// Validación de nodos
const numNodes = computed({
  get: () => _numNodes.value,
  set: (val: number) => {
    if (!val || val < 2) {
      _numNodes.value = 2;
    } 
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
      <div class="flex items-center w-full justify-between gap-4">
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

        <div class="flex items-center gap-2">
          <button
            @click="generateRandomGraph"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-95"
            title="Generar valores aleatorios"
          >
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4">
							<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
							<path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14" />
							<path d="M8 7.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />
							<path d="M15 7.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />
							<path d="M8 12a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />
							<path d="M15 12a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />
							<path d="M15 16.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />
							<path d="M8 16.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor" />
						</svg>
            <span class="hidden sm:inline">Aleatorio</span>
          </button>

          <button 
            @click="clearMatrix"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition active:scale-95"
            title="Vaciar todos los valores"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="hidden sm:inline">Vaciar</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="p-4 sm:p-6 overflow-x-auto w-full flex justify-center bg-white">
      <div class="inline-block rounded-lg border border-slate-200 overflow-hidden shadow-sm" v-if="rawMatrix.length">
        <table class="border-collapse table-fixed w-auto">
          <thead>
            <tr>
              <th class="p-2 bg-slate-50 border-r border-b border-slate-200 w-10 sm:w-12"></th>
              
              <th 
                v-for="node in nodes" 
                :key="'head-'+node" 
                class="animate-fade-in p-2 bg-slate-50 font-bold text-slate-600 text-xs sm:text-sm text-center select-none w-14 sm:w-16 border-b border-r border-slate-200 last:border-r-0"
              >
                {{ node }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in rawMatrix" :key="'row-'+nodes[i]" class="last:border-b-0">
							<td 
								class="p-2 bg-slate-50 border-r border-slate-200 font-bold text-center text-slate-600 text-xs sm:text-sm select-none"
								:class="{ 'border-b': i !== rawMatrix.length - 1 }"
							>
								{{ nodes[i] }}
							</td>

							<td 
								v-for="(_, j) in row" 
								:key="'cell-'+i+'-'+j" 
								class="animate-fade-in p-0 text-center relative h-10 sm:h-11 border-r border-slate-200 last:border-r-0"
								:class="{ 'border-b': i !== rawMatrix.length - 1 }"
							>
								<div 
									v-if="i === j"
									class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-medium text-sm cursor-not-allowed select-none"
								>
									0
								</div>

								<input 
									v-else
									type="number" 
									v-model.number="rawMatrix[i][j]" 
									placeholder="∞"
									class="w-full h-full text-center text-sm focus:ring-2 focus:ring-inset focus:ring-blue-500 outline-none transition-colors font-medium bg-white hover:bg-slate-50 text-slate-800 placeholder-slate-300"
								>
							</td>
            </tr>
          </tbody>
        </table>
      </div>
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