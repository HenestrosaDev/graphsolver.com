<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useGraph } from '../../composables/useGraph';

interface DijkstraStep {
  step: number;
  dists: (number | string)[]; 
  pivot: string;
}

const { getGraphData, nodes, toIdx, rawMatrix, numNodes, setHighlightPath, clearHighlights } = useGraph();

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

    const currentDistDisplay = dist.map(d => d === Infinity ? "∞" : d);
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
    
    clearHighlights(); 

  } else {
    finalCost.value = dist[eIdx];
    
    // Reconstruir camino
    let curr: number | null = eIdx;
    let pathArr: string[] = [];
    while (curr !== null) {
      pathArr.push(nodes.value[curr]);
      curr = parent[curr];
    }
    
    // Invertir para tener orden A -> B -> C
    pathArr = pathArr.reverse();
    
    finalPath.value = pathArr.join(" → ");

    // Envía el camino al grafo visual
    setHighlightPath(pathArr); 
  }
  isSolved.value = true;
};

// Opcional: Limpiar al salir de la pestaña si no quieres que persista
// onUnmounted(() => clearHighlights()); 

watch(
  [rawMatrix, numNodes, startNode, endNode], 
  () => solveDijkstra(),
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="animate-fade-in">
    <!-- Algorithm Controls -->
    <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wide">Origen</label>
          <select v-model="startNode" class="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium">
            <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="text-slate-400">→</div>

        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-slate-700 uppercase tracking-wide">Destino</label>
          <select v-model="endNode" class="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium">
            <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results -->
    <div v-if="isSolved" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Coste Mínimo</div>
          <div class="text-2xl font-mono font-bold text-slate-900">{{ finalCost }}</div>
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Camino Óptimo</div>
          <div class="text-2xl font-mono font-bold text-slate-900">{{ finalPath }}</div>
        </div>
      </div>

      <!-- Steps Table -->
      <div class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 class="font-bold text-slate-700 text-sm uppercase tracking-wide">Tabla de iteraciones</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 font-bold text-slate-700 text-left">Iteración</th>
                <th v-for="n in nodes" :key="n" class="px-4 py-3 text-center font-bold text-slate-600 w-12">{{ n }}</th>
                <th class="px-4 py-3 text-center font-bold text-blue-600">Pivote</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in steps" :key="row.step" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 font-medium text-slate-900">
                  Paso {{ row.step }}
                </td>
                <td v-for="(val, idx) in row.dists" :key="idx" class="px-4 py-3 text-center font-mono text-slate-600">
                  {{ val }}
                </td>
                <td class="px-4 py-3 text-center font-bold text-blue-600 bg-blue-50">
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