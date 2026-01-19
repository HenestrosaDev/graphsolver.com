<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGraph } from '../../composables/useGraph';
import type { FloydStep } from '../../types/graph';

const { getGraphData, nodes, toIdx } = useGraph();

// Estados tipados
const steps = ref<FloydStep[]>([]);
const diameter = ref<number>(0);
const hasInfPairs = ref<boolean>(false);

// Matrices finales para consultas
const finalDist = ref<number[][]>([]);
const finalNext = ref<(number | null)[][]>([]);

// Inputs de consulta
const startNode = ref<string>('A');
const endNode = ref<string>('B');

const solveFloyd = () => {
  const { n, matrix } = getGraphData();
  
  // Clonar matriz inicial para no mutar la referencia
  let dist: number[][] = matrix.map(row => [...row]);
  
  // Inicializar matriz Next
  let next: (number | null)[][] = Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => (matrix[i][j] !== Infinity && i !== j) ? j : null)
  );

  steps.value = [];
  
  // Paso 0
  steps.value.push({ 
    title: 'Matriz Inicial D(0)', 
    matrix: dist.map(r => [...r]), // Deep copy simple
    pivot: -1 
  });

  // Algoritmo O(n^3)
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          next[i][j] = next[i][k];
        }
      }
    }
    steps.value.push({ 
      title: `Iteración k=${k} (Pivote ${nodes.value[k]})`, 
      matrix: dist.map(r => [...r]), 
      pivot: k 
    });
  }

  finalDist.value = dist;
  finalNext.value = next;

  // Calcular Diámetro
  let maxD = 0;
  let infFound = false;
  for(let i=0; i<n; i++) {
    for(let j=0; j<n; j++) {
      if (i !== j) {
        if (dist[i][j] === Infinity) infFound = true;
        else if (dist[i][j] > maxD) maxD = dist[i][j];
      }
    }
  }
  diameter.value = maxD;
  hasInfPairs.value = infFound;
};

// Computed property con tipo de retorno explícito
const queryResult = computed<{ dist: number | string; path: string } | null>(() => {
  if (!finalDist.value.length) return null;
  
  const u = toIdx(startNode.value);
  const v = toIdx(endNode.value);
  
  // Validación de límites
  if (u < 0 || u >= finalDist.value.length || v < 0 || v >= finalDist.value.length) return null;

  const d = finalDist.value[u][v];

  if (d === Infinity) return { dist: 'Inalcanzable', path: '-' };

  let pathArr: string[] = [nodes.value[u]];
  let curr: number = u;
  
  // Reconstrucción del camino
  while (curr !== v) {
    const nextNode = finalNext.value[curr][v];
    if (nextNode === null) break; // Seguridad
    curr = nextNode;
    pathArr.push(nodes.value[curr]);
  }
  
  return { dist: d, path: pathArr.join('') };
});
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <p class="text-gray-600 mb-4 md:mb-0">Algoritmo Floyd-Warshall: Caminos mínimos todos los pares.</p>
      <button @click="solveFloyd" class="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded shadow-sm transition">
        Calcular Pasos
      </button>
    </div>

    <div v-if="steps.length">
      <div class="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-8">
        <h3 class="text-lg font-bold text-cyan-800 mb-4 border-b border-cyan-200 pb-2">Resultados Globales</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div class="bg-white p-4 rounded border border-cyan-100 shadow-sm">
            <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Diámetro</span>
            <span class="text-2xl font-mono text-gray-800">
              {{ diameter }} 
              <span v-if="hasInfPairs" class="text-xs text-red-500 font-sans ml-2">(Grafos inconexos)</span>
            </span>
          </div>

          <div class="bg-white p-4 rounded border border-cyan-100 shadow-sm">
            <span class="block text-xs font-bold text-gray-500 uppercase mb-2">Consulta de Camino</span>
            <div class="flex items-center gap-2 mb-3">
              <select v-model="startNode" class="bg-gray-50 border border-gray-300 rounded p-1 font-bold text-blue-600 cursor-pointer">
                <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
              </select>
              <span class="text-gray-400">➜</span>
              <select v-model="endNode" class="bg-gray-50 border border-gray-300 rounded p-1 font-bold text-blue-600 cursor-pointer">
                <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            
            <div v-if="queryResult" class="space-y-1">
              <div class="flex justify-between border-b border-gray-100 pb-1">
                <span class="text-gray-600 text-sm">Distancia:</span> 
                <strong class="text-gray-800">{{ queryResult.dist }}</strong>
              </div>
              <div class="flex justify-between pt-1">
                <span class="text-gray-600 text-sm">Camino:</span> 
                <strong class="font-mono text-blue-600">{{ queryResult.path }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="text-xl font-bold text-gray-700 mb-4">Matrices de Iteraciones</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="(step, idx) in steps" :key="idx" class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <h4 class="bg-gray-100 px-4 py-2 font-bold text-gray-700 text-center border-b border-gray-200 text-sm">
            {{ step.title }}
          </h4>
          <div class="overflow-x-auto p-4">
            <table class="w-full text-sm border-collapse mx-auto">
              <tr>
                <th class="p-1"></th>
                <th v-for="n in nodes" :key="n" class="p-1 font-bold text-gray-500 text-xs">{{ n }}</th>
              </tr>
              <tr v-for="(row, i) in step.matrix" :key="i">
                <th class="p-1 font-bold text-gray-500 text-xs">{{ nodes[i] }}</th>
                <td v-for="(val, j) in row" :key="j"
                    class="p-1 border border-gray-100 text-center text-xs"
                    :class="{'bg-yellow-100 font-bold text-blue-700': i === step.pivot || j === step.pivot}">
                  {{ val === Infinity ? '∞' : val }}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>