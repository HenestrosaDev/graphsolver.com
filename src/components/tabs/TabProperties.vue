<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';
import type { GraphAnalysis } from '../../types/graph';

const { getGraphData, nodes, toIdx, rawMatrix, numNodes } = useGraph();

const analysis = ref<GraphAnalysis | null>(null);
const adjTarget = ref<string>('A');

const calculateProperties = () => {
  const { n, hasArc, isSymmetric } = getGraphData();
  
  // Validar target
  if (toIdx(adjTarget.value) >= n) adjTarget.value = nodes.value[0];

  let totalArcs = 0;
  let degrees = new Array(n).fill(0);
  let inD = new Array(n).fill(0);

  for(let i=0; i<n; i++) {
    for(let j=0; j<n; j++) {
      if(hasArc[i][j]) { 
        totalArcs++; 
        degrees[i]++; 
        inD[j]++; 
      }
    }
  }

  const measure = isSymmetric ? totalArcs / 2 : totalArcs;

  const tIdx = toIdx(adjTarget.value);
  let adjNodes: string[] = [];
  if (tIdx >= 0 && tIdx < n) {
    for(let j=0; j<n; j++) if(hasArc[tIdx][j]) adjNodes.push(nodes.value[j]);
  }
  adjNodes.sort((a, b) => b.localeCompare(a));

  let isolated = 0;
  for(let i=0; i<n; i++) if((degrees[i] + inD[i]) === 0) isolated++;

  const countComponents = (adjacencyMatrix: boolean[][]) => {
    let visited = new Array(n).fill(false);
    let count = 0;
    for(let i=0; i<n; i++){
      if(!visited[i]){
        count++;
        let q = [i]; visited[i] = true;
        while(q.length){
          let u = q.shift()!;
          for(let v=0; v<n; v++){
            if(!visited[v] && (adjacencyMatrix[u][v] || adjacencyMatrix[v][u])) { 
              visited[v]=true; q.push(v); 
            }
          }
        }
      }
    }
    return count;
  };

  const cc = countComponents(hasArc);
  const maxEdges = isSymmetric ? (n*(n-1))/2 : n*(n-1);
  const compSize = Math.max(0, maxEdges - measure);

  let compMatrix: boolean[][] = [];
  for(let i=0; i<n; i++){
    compMatrix[i] = [];
    for(let j=0; j<n; j++) compMatrix[i][j] = (i !== j && !hasArc[i][j]);
  }
  const compCc = countComponents(compMatrix);

  analysis.value = {
    orden: n,
    medida: measure,
    isSymmetric,
    adjList: adjNodes.join(', '),
    seq: [...degrees].sort((a,b) => b-a).join(', '),
    isolated,
    cc,
    compSize,
    compCc
  };
};

watch(
  [rawMatrix, numNodes, adjTarget], 
  () => calculateProperties(), 
  { deep: true, immediate: true }
);
</script>

<template>
  <div class="animate-fade-in" v-if="analysis">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="col-span-full p-4 rounded-lg border flex items-center gap-3 shadow-sm transition-colors duration-500"
           :class="analysis.isSymmetric ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-purple-50 border-purple-200 text-purple-900'">
        <span class="text-2xl">{{ analysis.isSymmetric ? '↔️' : '↗️' }}</span>
        <div>
          <strong class="block text-sm uppercase tracking-wide opacity-70">Tipo Detectado</strong>
          <span class="text-lg font-bold">
            {{ analysis.isSymmetric ? 'Grafo Simétrico (No Dirigido)' : 'Grafo Dirigido' }}
          </span>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="prop-card">
          <span class="label">Orden (Vértices)</span>
          <span class="value">{{ analysis.orden }}</span>
        </div>
        <div class="prop-card">
          <span class="label">Medida ({{ analysis.isSymmetric ? 'Aristas' : 'Arcos' }})</span>
          <span class="value">{{ analysis.medida }}</span>
        </div>
        
        <div class="prop-card">
          <div class="flex justify-between items-center w-full mb-1">
            <span class="label mb-0">Adyacentes a:</span>
            <select v-model="adjTarget" class="bg-white border border-gray-300 rounded text-xs p-1 text-blue-600 font-bold cursor-pointer outline-none">
              <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <span class="value text-base">{{ analysis.adjList || 'Ninguno' }}</span>
        </div>

        <div class="prop-card">
          <span class="label">Secuencia de Grados</span>
          <span class="value tracking-tighter">{{ analysis.seq }}</span>
        </div>
      </div>
      
      <div class="space-y-4">
         <div class="prop-card">
          <span class="label">Vértices Aislados</span>
          <span class="value">{{ analysis.isolated }}</span>
        </div>
        <div class="prop-card">
          <span class="label">Componentes Conexas</span>
          <span class="value">{{ analysis.cc }}</span>
        </div>
         <div class="prop-card border-l-purple-500">
          <span class="label text-purple-600">Medida Complementario</span>
          <span class="value">{{ analysis.compSize }}</span>
        </div>
        <div class="prop-card border-l-purple-500">
          <span class="label text-purple-600">C.C. Complementario</span>
          <span class="value">{{ analysis.compCc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>