<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGraph } from '../../composables/useGraph';
import type { GraphAnalysis } from '../../types/graph';

const { getGraphData, nodes, toIdx } = useGraph();

const analysis = ref<GraphAnalysis | null>(null);
const adjTarget = ref<string>('A'); // Vértice seleccionado en el dropdown

const calculateProperties = () => {
  const { n, hasArc, isSymmetric } = getGraphData();
  
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

  // Medida: Si es simétrico dividimos por 2 (Aristas), si no Arcos
  const measure = isSymmetric ? totalArcs / 2 : totalArcs;

  // Adyacentes del nodo seleccionado
  const tIdx = toIdx(adjTarget.value);
  let adjNodes: string[] = [];
  if (tIdx >= 0 && tIdx < n) {
    for(let j=0; j<n; j++) if(hasArc[tIdx][j]) adjNodes.push(nodes.value[j]);
  }
  // Ordenar Z -> A
  adjNodes.sort((a, b) => b.localeCompare(a));

  // Aislados
  let isolated = 0;
  for(let i=0; i<n; i++) if((degrees[i] + inD[i]) === 0) isolated++;

  // Componentes Conexas (BFS)
  const countComponents = (adjacencyMatrix: boolean[][]) => {
    let visited = new Array(n).fill(false);
    let count = 0;
    for(let i=0; i<n; i++){
      if(!visited[i]){
        count++;
        let q = [i]; 
        visited[i] = true;
        while(q.length){
          let u = q.shift()!;
          for(let v=0; v<n; v++){
            // Conexión débil o fuerte
            if(!visited[v] && (adjacencyMatrix[u][v] || adjacencyMatrix[v][u])) { 
              visited[v]=true; 
              q.push(v); 
            }
          }
        }
      }
    }
    return count;
  };

  const cc = countComponents(hasArc);

  // Complementario
  const maxEdges = isSymmetric ? (n*(n-1))/2 : n*(n-1);
  const compSize = Math.max(0, maxEdges - measure);

  // Matriz Complementaria
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
    adjList: adjNodes.join(','),
    seq: [...degrees].sort((a,b) => b-a).join(','),
    isolated,
    cc,
    compSize,
    compCc
  };
};

// Recalcular cuando cambia el select
const updateAdj = () => {
  if(analysis.value) calculateProperties();
};
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 border-b border-gray-100 pb-4">
      <button @click="calculateProperties" class="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded shadow-sm transition">
        Actualizar Análisis
      </button>
    </div>

    <div v-if="analysis" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="col-span-full p-3 rounded-lg border flex items-center gap-3"
           :class="analysis.isSymmetric ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-purple-50 border-purple-200 text-purple-800'">
        <span class="text-xl">{{ analysis.isSymmetric ? 'ℹ️' : '⚡' }}</span>
        <span>
          <strong>{{ analysis.isSymmetric ? 'Grafo Simétrico' : 'Grafo Dirigido' }}</strong>. 
          {{ analysis.isSymmetric ? 'Medida calculada en Aristas.' : 'Medida calculada en Arcos.' }}
        </span>
      </div>
      
      <div class="space-y-4">
        <div class="prop-card">
          <span class="label">Orden</span>
          <span class="value">{{ analysis.orden }}</span>
        </div>
        <div class="prop-card">
          <span class="label">Medida</span>
          <span class="value">{{ analysis.medida }}</span>
        </div>
        
        <div class="prop-card">
          <div class="flex justify-between items-center w-full mb-2">
            <span class="label mb-0">Adyacentes a:</span>
            <select v-model="adjTarget" @change="updateAdj" class="border border-gray-300 rounded text-sm p-1 text-blue-600 font-bold bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500">
              <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <span class="value">{{ analysis.adjList || '-' }}</span>
          <span class="text-xs text-gray-400 italic mt-1 block">Ordenados mayor a menor</span>
        </div>

        <div class="prop-card">
          <span class="label">Secuencia de Grados</span>
          <span class="value">{{ analysis.seq }}</span>
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

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>