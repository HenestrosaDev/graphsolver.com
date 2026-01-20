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
    <!-- Graph Type Indicator -->
    <div class="bg-white border border-slate-200 rounded-lg p-4 mb-4 shadow-sm">
      <div class="flex items-center gap-3">
        <span class="text-2xl">{{ analysis.isSymmetric ? '↔️' : '↗️' }}</span>
        <div>
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo de Grafo</div>
          <div class="text-lg font-bold text-slate-900">
            {{ analysis.isSymmetric ? 'No Dirigido' : 'Dirigido' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Properties Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Orden (Vértices)</div>
          <div class="text-2xl font-mono font-bold text-slate-900">{{ analysis.orden }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Medida ({{ analysis.isSymmetric ? 'Aristas' : 'Arcos' }})</div>
          <div class="text-2xl font-mono font-bold text-slate-900">{{ analysis.medida }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Adyacentes a</div>
          <div class="flex items-center gap-2 mb-2">
            <select v-model="adjTarget" class="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="text-lg font-mono text-blue-600 font-medium">{{ analysis.adjList || 'Ninguno' }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Secuencia de Grados</div>
          <div class="text-sm font-mono text-slate-900 break-all">{{ analysis.seq }}</div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Vértices Aislados</div>
          <div class="text-2xl font-mono font-bold text-slate-900">{{ analysis.isolated }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Componentes Conexas</div>
          <div class="text-2xl font-mono font-bold text-slate-900">{{ analysis.cc }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm border-l-purple-500">
          <div class="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">Medida Complementario</div>
          <div class="text-2xl font-mono font-bold text-purple-900">{{ analysis.compSize }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm border-l-purple-500">
          <div class="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">C.C. Complementario</div>
          <div class="text-2xl font-mono font-bold text-purple-900">{{ analysis.compCc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>