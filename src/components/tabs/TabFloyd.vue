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
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Diámetro del Grafo</div>
        <div class="text-2xl font-mono font-bold text-slate-900">
          {{ diameter }}
          <span v-if="hasInfPairs" class="text-xs text-red-500 ml-2">(pares inalcanzables)</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Consulta de Camino</div>
        <div class="flex items-center gap-2 mb-3">
          <select v-model="startNode" class="bg-white border border-slate-300 rounded px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
          </select>
          <span class="text-slate-400">→</span>
          <select v-model="endNode" class="bg-white border border-slate-300 rounded px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div v-if="queryResult" class="space-y-2">
          <div class="flex justify-between items-center py-1 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Distancia</span>
            <span class="font-mono font-medium text-slate-900">{{ queryResult.dist }}</span>
          </div>
          <div class="flex justify-between items-center py-1">
            <span class="text-xs font-bold text-slate-500 uppercase">Camino</span>
            <span class="font-mono text-sm text-blue-600 font-medium">{{ queryResult.path }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Matrices Grid -->
    <div class="mb-4">
      <h3 class="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
        </svg>
        Matrices de Iteraciones
      </h3>
    </div>

    <div class="flex flex-col gap-4">
      <div v-for="(step, idx) in steps" :key="idx" class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div class="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h4 class="font-bold text-slate-700 text-center text-sm uppercase tracking-wide">
            {{ step.title }}
          </h4>
        </div>
        <div class="p-4 flex justify-center">
          <table class="text-sm border-collapse">
            <thead>
              <tr>
                <th class="p-2"></th>
                <th v-for="n in nodes" :key="n" class="p-2 font-bold text-slate-500 text-xs w-8 text-center">{{ n }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in step.matrix" :key="i">
                <th class="p-2 font-bold text-slate-500 text-xs w-8 text-center">{{ nodes[i] }}</th>
                <td v-for="(val, j) in row" :key="j"
                    class="p-2 border border-slate-100 text-center text-xs w-8 h-8 font-mono"
                    :class="{'bg-blue-50 font-bold text-blue-700 border-blue-200': i === step.pivot || j === step.pivot}">
                  {{ val === Infinity ? '∞' : val }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>