<script setup lang="ts">
import { onMounted } from 'vue';
import { useGraph } from '../composables/useGraph';

// Importamos numNodes directamente para usarlo en el v-model
const { nodes, rawMatrix, numNodes, treatZeroAsNull, createGrid } = useGraph();

onMounted(() => {
  if (rawMatrix.value.length === 0) createGrid();
});
</script>

<template>
  <div class="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
    
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-100">
      
      <div class="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
        <label for="vertex-input" class="text-sm font-bold text-blue-800 uppercase tracking-wide">
          Número de Vértices:
        </label>
        <div class="relative flex items-center">
          <button 
            @click="numNodes > 2 ? numNodes-- : null"
            class="w-8 h-8 flex items-center justify-center bg-white rounded-l border border-blue-200 text-blue-600 hover:bg-blue-100 font-bold transition"
          >-</button>
          <input 
            id="vertex-input"
            type="number" 
            v-model.number="numNodes" 
            min="2" max="26"
            class="w-12 h-8 text-center border-t border-b border-blue-200 text-blue-900 font-bold focus:outline-none appearance-none m-0"
          >
          <button 
            @click="numNodes < 26 ? numNodes++ : null"
            class="w-8 h-8 flex items-center justify-center bg-white rounded-r border border-blue-200 text-blue-600 hover:bg-blue-100 font-bold transition"
          >+</button>
        </div>
      </div>

      <div class="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
        <label class="flex items-center cursor-pointer select-none text-gray-700 font-medium text-sm">
          <input type="checkbox" v-model="treatZeroAsNull" class="w-4 h-4 text-blue-600 rounded mr-2 focus:ring-blue-500">
          Interpretar '0' como "Sin Conexión"
        </label>
      </div>
    </div>
    
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-gray-700">Matriz de Adyacencia</h3>
      <p class="text-xs text-gray-400">
        Usa <span class="font-mono bg-gray-100 px-1 rounded text-gray-600">-1</span> para ∞
      </p>
    </div>
    
    <div class="overflow-x-auto pb-2 flex justify-start md:justify-center">
      <table class="border-collapse table-fixed transition-all duration-300" v-if="rawMatrix.length">
        <thead>
          <tr>
            <th class="w-10 p-2 border border-gray-200 bg-gray-50"></th>
            <th v-for="node in nodes" :key="node" class="w-14 p-2 border border-gray-200 bg-gray-50 font-bold text-gray-600 text-sm text-center">
              {{ node }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rawMatrix" :key="i">
            <td class="w-10 p-2 border border-gray-200 bg-gray-50 font-bold text-center text-gray-600 text-sm">
              {{ nodes[i] }}
            </td>
            <td v-for="(_, j) in row" :key="j" class="p-1 border border-gray-200 text-center">
              <input 
                type="number" 
                v-model.number="rawMatrix[i][j]" 
                :disabled="i === j"
                placeholder="∞"
                :class="[
                  'w-12 py-1 px-0 text-sm border rounded text-center focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-200',
                  i === j ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-transparent' : 'border-gray-300 bg-white hover:border-blue-300'
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
/* Ocultar flechas del input number para un look más limpio */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>