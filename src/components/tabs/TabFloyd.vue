<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';
import type { FloydStep } from '../../types/graph';

// Traemos rawMatrix y numNodes para observarlos
const { getGraphData, nodes, toIdx, rawMatrix, numNodes } = useGraph();

const steps = ref<FloydStep[]>([]);
const diameter = ref<number>(0);
const hasInfPairs = ref<boolean>(false);
const finalDist = ref<number[][]>([]);
const finalNext = ref<(number | null)[][]>([]);

const startNode = ref<string>('A');
const endNode = ref<string>('B');

const solveFloyd = () => {
  const { n, matrix } = getGraphData();
  
  // Copia profunda para trabajar
  let dist: number[][] = matrix.map(row => [...row]);
  
  let next: (number | null)[][] = Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => (matrix[i][j] !== Infinity && i !== j) ? j : null)
  );

  steps.value = [];
  
  // Paso 0
  steps.value.push({ 
    title: 'Matriz Inicial D(0)', 
    matrix: dist.map(r => [...r]),
    pivot: -1 
  });

  // Algoritmo
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

  // Diámetro
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

// --- REACTIVIDAD AUTOMÁTICA ---
// deep: true detecta cambios dentro de la matriz
// immediate: true calcula nada más cargar el componente
watch(
  [rawMatrix, numNodes], 
  () => solveFloyd(), 
  { deep: true, immediate: true }
);

const queryResult = computed(() => {
  if (!finalDist.value.length) return null;
  
  // Validar que los nodos seleccionados existan (por si reducimos vértices)
  if (toIdx(startNode.value) >= numNodes.value) startNode.value = nodes.value[0];
  if (toIdx(endNode.value) >= numNodes.value) endNode.value = nodes.value[numNodes.value - 1];

  const u = toIdx(startNode.value);
  const v = toIdx(endNode.value);
  
  if (u < 0 || u >= finalDist.value.length || v < 0 || v >= finalDist.value.length) return null;

  const d = finalDist.value[u][v];
  if (d === Infinity) return { dist: 'Inalcanzable', path: '-' };

  let pathArr: string[] = [nodes.value[u]];
  let curr: number = u;
  while (curr !== v) {
    const nextNode = finalNext.value[curr][v];
    if (nextNode === null) break; 
    curr = nextNode;
    pathArr.push(nodes.value[curr]);
  }
  return { dist: d, path: pathArr.join(' → ') };
});
</script>

<template>
  <div class="animate-fade-in">
    <div class="bg-cyan-50 border border-cyan-200 rounded-lg p-6 mb-8">
       <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white p-4 rounded border border-cyan-100 shadow-sm">
            <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Diámetro del Grafo</span>
            <span class="text-2xl font-mono text-gray-800">
              {{ diameter }} 
              <span v-if="hasInfPairs" class="text-xs text-red-500 font-sans ml-2">(Existen pares inalcanzables)</span>
            </span>
          </div>

          <div class="bg-white p-4 rounded border border-cyan-100 shadow-sm">
            <span class="block text-xs font-bold text-gray-500 uppercase mb-2">Consulta de Camino</span>
            <div class="flex items-center gap-2 mb-3">
              <select v-model="startNode" class="bg-gray-50 border border-gray-300 rounded p-1 font-bold text-blue-600 cursor-pointer text-sm">
                <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
              </select>
              <span class="text-gray-400">➜</span>
              <select v-model="endNode" class="bg-gray-50 border border-gray-300 rounded p-1 font-bold text-blue-600 cursor-pointer text-sm">
                <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
            
            <div v-if="queryResult" class="space-y-1">
              <div class="flex justify-between border-b border-gray-100 pb-1">
                <span class="text-gray-600 text-xs uppercase font-bold">Distancia</span> 
                <strong class="text-gray-800">{{ queryResult.dist }}</strong>
              </div>
              <div class="flex justify-between pt-1">
                <span class="text-gray-600 text-xs uppercase font-bold">Camino</span> 
                <strong class="font-mono text-blue-600 text-sm">{{ queryResult.path }}</strong>
              </div>
            </div>
          </div>
       </div>
    </div>

    <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
      Matrices de Iteraciones
      <span class="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded">Se actualiza automáticamente</span>
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
       <div v-for="(step, idx) in steps" :key="idx" class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <h4 class="bg-gray-100 px-4 py-2 font-bold text-gray-700 text-center border-b border-gray-200 text-xs uppercase tracking-wide">
            {{ step.title }}
          </h4>
          <div class="overflow-x-auto p-4 flex justify-center">
            <table class="text-sm border-collapse">
              <tr>
                <th class="p-1"></th>
                <th v-for="n in nodes" :key="n" class="p-1 font-bold text-gray-500 text-xs w-8 text-center">{{ n }}</th>
              </tr>
              <tr v-for="(row, i) in step.matrix" :key="i">
                <th class="p-1 font-bold text-gray-500 text-xs w-8 text-center">{{ nodes[i] }}</th>
                <td v-for="(val, j) in row" :key="j"
                    class="p-1 border border-gray-100 text-center text-xs w-8 h-8"
                    :class="{'bg-yellow-100 font-bold text-blue-700': i === step.pivot || j === step.pivot}">
                  {{ val === Infinity ? '∞' : val }}
                </td>
              </tr>
            </table>
          </div>
        </div>
    </div>
  </div>
</template>