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

// --- CARROUSEL STATE ---
const currentStepIndex = ref(0);
const currentStep = computed(() => steps.value[currentStepIndex.value]);

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
  
  // Paso 0: Matriz Inicial
  steps.value.push({ 
    title: 'Estado Inicial D(0)', 
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
watch(
  [rawMatrix, numNodes], 
  () => {
    solveFloyd();
    // Resetear el carrousel al inicio cuando cambie el grafo
    currentStepIndex.value = 0;
  }, 
  { deep: true, immediate: true }
);

const queryResult = computed(() => {
  if (!finalDist.value.length) return null;
  
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

// --- FUNCIONES DE NAVEGACIÓN ---
const nextStep = () => {
  if (currentStepIndex.value < steps.value.length - 1) currentStepIndex.value++;
};
const prevStep = () => {
  if (currentStepIndex.value > 0) currentStepIndex.value--;
};
</script>

<template>
  <div class="animate-fade-in space-y-6">
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

    <div 
      v-if="steps.length > 0" 
      class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
    >
      <div class="bg-slate-50 border-b border-slate-200 p-4">
        <div class="flex flex-col items-center">
          <span class="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Paso {{ currentStepIndex + 1 }} de {{ steps.length }}
          </span>

          <h3 class="font-bold text-slate-800 text-lg mt-3">
            {{ currentStep.title }}
          </h3>

          <div class="flex items-center justify-center gap-3 w-full max-w-md -mb-1">
            <button 
              @click="prevStep" 
              :disabled="currentStepIndex === 0"
              class="p-1.5 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:shadow-none disabled:hover:border-transparent transition-all"
              title="Anterior">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <div class="flex-1 mx-2 relative flex items-center">
              <input 
                type="range" 
                min="0" 
                :max="steps.length - 1" 
                v-model.number="currentStepIndex"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
            </div>

            <button 
              @click="nextStep" 
              :disabled="currentStepIndex === steps.length - 1"
              class="p-1.5 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:shadow-none disabled:hover:border-transparent transition-all"
              title="Siguiente">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div class="p-6 overflow-x-auto flex justify-center min-h-[300px] items-center bg-white transition-all duration-300">
        <table class="text-sm border-collapse shadow-sm rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th class="p-3 bg-slate-50 border-b border-slate-200"></th>
              <th v-for="n in nodes" :key="n" class="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-xs w-10 text-center">{{ n }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in currentStep.matrix" :key="i">
              <th class="p-3 bg-slate-50 border-r border-slate-200 font-bold text-slate-500 text-xs w-10 text-center">
                {{ nodes[i] }}
              </th>
              
              <td v-for="(val, j) in row" :key="j"
                  class="p-3 border border-slate-100 text-center text-sm w-12 h-12 font-mono transition-colors duration-200"
                  :class="{
                    'bg-blue-50 font-bold text-blue-700 ring-1 ring-inset ring-blue-200': i === currentStep.pivot || j === currentStep.pivot,
                    'text-slate-400': val === Infinity,
                    'text-slate-800': val !== Infinity
                  }">
                {{ val === Infinity ? '∞' : val }}
              </td>
            </tr>
          </tbody>
        </table>

      </div>

      <div class="bg-slate-50 p-3 text-xs text-slate-500 text-center border-t border-slate-200">
        <span v-if="currentStep.pivot === -1">Matriz de adyacencia inicial. Los nodos no conectados directamente son ∞.</span>
        <span v-else>
          Calculando rutas pasando por el nodo intermedio <strong>{{ nodes[currentStep.pivot] }}</strong>.
          Las filas y columnas resaltadas no cambian en esta iteración.
        </span>
      </div>

    </div>
  </div>
</template>