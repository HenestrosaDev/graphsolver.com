<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';

interface DijkstraStep {
  step: number;
  dists: (number | string)[]; 
  pivot: string;
}

const { getGraphData, nodes, toIdx, rawMatrix, numNodes } = useGraph();

const startNode = ref<string>('A');
const endNode = ref<string>('B'); // Cambiado a B por defecto para que no sea el mismo
const steps = ref<DijkstraStep[]>([]);
const finalCost = ref<string | number>('-');
const finalPath = ref<string>('-');
const isSolved = ref(false);

const solveDijkstra = () => {
  const { n, matrix } = getGraphData();
  
  // Validar límites: si reducimos vértices y teníamos seleccionada la 'Z', resetear.
  if (toIdx(startNode.value) >= n) startNode.value = nodes.value[0];
  if (toIdx(endNode.value) >= n) endNode.value = nodes.value[n - 1] || nodes.value[0];

  const sIdx = toIdx(startNode.value);
  const eIdx = toIdx(endNode.value);
  
  // Inicialización
  const dist = new Array(n).fill(Infinity);
  const visited = new Array(n).fill(false);
  const parent = new Array(n).fill(null);
  
  dist[sIdx] = 0;
  steps.value = [];

  for (let i = 0; i < n; i++) {
    let u = -1;
    let minVal = Infinity;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && dist[v] < minVal) {
        minVal = dist[v];
        u = v;
      }
    }

    const currentDistDisplay = dist.map(d => d === Infinity ? -1 : d);
    const pivotChar = (u !== -1) ? nodes.value[u] : "-";
    steps.value.push({ step: i, dists: currentDistDisplay, pivot: pivotChar });

    if (u === -1) break;
    visited[u] = true;

    for (let v = 0; v < n; v++) {
      if (!visited[v] && matrix[u][v] !== Infinity && dist[u] !== Infinity) {
        if (dist[u] + matrix[u][v] < dist[v]) {
          dist[v] = dist[u] + matrix[u][v];
          parent[v] = u;
        }
      }
    }
  }

  if (dist[eIdx] === Infinity) {
    finalCost.value = "Inalcanzable";
    finalPath.value = "No existe camino";
  } else {
    finalCost.value = dist[eIdx];
    let curr: number | null = eIdx;
    let pathArr: string[] = [];
    while (curr !== null) {
      pathArr.push(nodes.value[curr]);
      curr = parent[curr];
    }
    finalPath.value = pathArr.reverse().join(" → ");
  }
  isSolved.value = true;
};

// Observar TODO: matriz, nº nodos, origen y destino
watch(
  [rawMatrix, numNodes, startNode, endNode], 
  () => solveDijkstra(),
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="animate-fade-in">
    <div class="flex flex-wrap items-center gap-6 mb-6 bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
      
      <div class="flex items-center gap-3">
        <label class="text-xs font-bold text-blue-800 uppercase">Origen</label>
        <select v-model="startNode" class="bg-white border border-blue-300 text-blue-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 font-bold cursor-pointer outline-none">
          <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="text-blue-300">➜</div>

      <div class="flex items-center gap-3">
        <label class="text-xs font-bold text-blue-800 uppercase">Destino</label>
        <select v-model="endNode" class="bg-white border border-blue-300 text-blue-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 font-bold cursor-pointer outline-none">
          <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>

      <div class="ml-auto text-xs text-blue-400 italic font-medium">
        Cálculo en tiempo real
      </div>
    </div>

    <div v-if="isSolved" class="space-y-6">
      
      <div class="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm">
        <div class="flex-1 w-full text-center md:text-left">
          <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Coste Mínimo</span>
          <div class="bg-white p-3 rounded border border-green-200 inline-block w-full md:w-auto min-w-[120px]">
            <span class="text-2xl font-mono font-bold text-green-700">{{ finalCost }}</span>
          </div>
        </div>
        <div class="flex-[2] w-full text-center md:text-left">
          <span class="block text-xs font-bold text-gray-500 uppercase mb-1">Camino</span>
          <div class="bg-white p-3 rounded border border-green-200 block w-full">
            <span class="text-xl font-mono font-bold text-blue-600 tracking-wider break-all">
              {{ finalPath }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 class="font-bold text-gray-700 text-sm uppercase">Tabla de Pasos</h3>
          <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 font-mono">-1 = ∞</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 font-bold">Iteración</th>
                <th v-for="n in nodes" :key="n" class="px-4 py-3 text-center w-12">{{ n }}</th>
                <th class="px-4 py-3 text-center text-blue-600 font-bold">Pivot</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in steps" :key="row.step" class="hover:bg-blue-50/50 transition-colors">
                <td class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                  Paso i={{ row.step }}
                </td>
                <td v-for="(val, idx) in row.dists" :key="idx" class="px-4 py-3 text-center font-mono text-gray-600">
                  {{ val }}
                </td>
                <td class="px-4 py-3 text-center font-bold text-pink-600 bg-pink-50/30">
                  {{ row.pivot }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>