<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';
import type { GraphAnalysis } from '../../types/graph';

const { getGraphData, nodes, toIdx, rawMatrix, numNodes } = useGraph();

const analysis = ref<GraphAnalysis | null>(null);
const adjTarget = ref<string>('A');

const calculateProperties = () => {
  const { n, hasArc, isSymmetric } = getGraphData();
  
  // Validate target
  if (toIdx(adjTarget.value) >= n) adjTarget.value = nodes.value[0];

  let totalArcs = 0;
  let degrees = new Array(n).fill(0);
  let inD = new Array(n).fill(0);

  // 1. Basic Counts & Degrees
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

  // 2. Adjacency List for Target
  const tIdx = toIdx(adjTarget.value);
  let adjNodes: string[] = [];
  if (tIdx >= 0 && tIdx < n) {
    for(let j=0; j<n; j++) if(hasArc[tIdx][j]) adjNodes.push(nodes.value[j]);
  }
  adjNodes.sort((a, b) => b.localeCompare(a));

  // 3. Isolated Vertices
  let isolated = 0;
  for(let i=0; i<n; i++) if((degrees[i] + inD[i]) === 0) isolated++;

  // 4. Connected Components (BFS)
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

  // 5. Complementary Graph Stats
  const maxEdges = isSymmetric ? (n*(n-1))/2 : n*(n-1);
  const compSize = Math.max(0, maxEdges - measure);

  let compMatrix: boolean[][] = [];
  for(let i=0; i<n; i++){
    compMatrix[i] = [];
    for(let j=0; j<n; j++) compMatrix[i][j] = (i !== j && !hasArc[i][j]);
  }
  const compCc = countComponents(compMatrix);

  // 6. Density & Completeness
  const density = maxEdges > 0 ? (measure / maxEdges) : 0;
  const isComplete = n > 1 && measure === maxEdges;

  // 7. Min/Max Degree & Regularity
  const maxDegree = n > 0 ? Math.max(...degrees) : 0;
  const minDegree = n > 0 ? Math.min(...degrees) : 0;
  const isRegular = n > 0 && maxDegree === minDegree;

  // 8. Tree / Forest logic
  const isForest = isSymmetric && measure === (n - cc);
  const isTree = isSymmetric && cc === 1 && measure === (n - 1);

  // 9. Eulerian logic
  let eulerianType = 'No';
  if (isSymmetric && measure > 0) {
    const oddDegreeCount = degrees.filter(d => d % 2 !== 0).length;
    if (oddDegreeCount === 0) eulerianType = 'Ciclo';
    else if (oddDegreeCount === 2) eulerianType = 'Camino';
  }

  // 10. Extended Structure Analysis
  const isConnected = cc === 1;
  const hasCycles = measure >= (n - cc + 1);

  let structureType = 'Desconocido';
  if (isSymmetric) {
    if (!hasCycles && isConnected) structureType = 'Árbol';
    else if (!hasCycles && !isConnected) structureType = 'Bosque';
    else if (hasCycles && isConnected) structureType = 'Cíclico conexo';
    else structureType = 'Disconexo con ciclos';
  } else {
    if (isConnected) structureType = hasCycles ? 'Conexo (débil) con ciclos' : 'DAG Conexo (Débil)';
    else structureType = 'Disconexo';
  }

  // 11. Hamiltonian Cycle (Backtracking)
  let isHamiltonian: boolean | string = false;
  if (n < 3) isHamiltonian = false;
  else if (n > 12) isHamiltonian = 'NP-Limit (>12)';
  else if (!isConnected) isHamiltonian = false;
  else {
    const visited = new Array(n).fill(false);
    const checkHamiltonianRecursive = (u: number, count: number): boolean => {
      if (count === n) return isSymmetric ? (hasArc[u][0] || hasArc[0][u]) : hasArc[u][0];
      for (let v = 0; v < n; v++) {
        const hasEdge = isSymmetric ? (hasArc[u][v] || hasArc[v][u]) : hasArc[u][v];
        if (hasEdge && !visited[v]) {
          visited[v] = true;
          if (checkHamiltonianRecursive(v, count + 1)) return true;
          visited[v] = false;
        }
      }
      return false;
    };
    visited[0] = true;
    isHamiltonian = checkHamiltonianRecursive(0, 1);
  }

  analysis.value = {
    orden: n,
    medida: measure,
    isSymmetric,
    adjList: adjNodes.join(','),
    seq: [...degrees].join(','),
    isolated,
    cc,
    compSize,
    compCc,
    density,
    isComplete,
    minDegree,
    maxDegree,
    isRegular,
    isTree,
    isForest,
    eulerianType,
    isConnected,
    hasCycles,
    structureType,
    isHamiltonian
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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
            Propiedades Básicas
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Tipo de grafo</span>
              <span class="text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200 flex items-center gap-2">
                <span>{{ analysis.isSymmetric ? 'No dirigido' : 'Dirigido' }}</span>
              </span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Orden (Vértices)</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ analysis.orden }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Medida (Aristas)</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ analysis.medida }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Densidad</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ (analysis.density * 100).toFixed(0) }}%</span>
            </div>
            <div v-if="analysis.isComplete" class="text-center">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider border border-green-200">
                Grafo completo (K{{ analysis.orden }})
              </span>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">Grados</div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium shrink-0">Secuencia de grados</span>
              <div class="text-xl font-mono font-bold text-slate-900 break-all">{{ analysis.seq }}</div>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Grado mínimo (δ)</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ analysis.minDegree }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Grado máximo (Δ)</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ analysis.maxDegree }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Regularidad</span>
              <div>
                <span v-if="analysis.isRegular" class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold border border-indigo-200">
                  {{ analysis.maxDegree }}-Regular
                </span>
                <span v-else class="text-slate-400 text-xs italic">No regular</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
            Vértices adyacentes a
            <select v-model="adjTarget" class="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
              <option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
          <div class="space-y-3">
            <div class="text-xl font-mono font-bold text-slate-900">{{ analysis.adjList || '∅' }}</div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
            Topología
          </div>

          <div class="space-y-3">
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Clasificación Estructural</span>
              <span class="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                {{ analysis.structureType }}
              </span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Euleriano</span>
              <span class="px-2 py-1 rounded text-xs font-bold border" 
                :class="analysis.eulerianType !== 'No' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-600 border-red-200'">
                {{ analysis.eulerianType }}
              </span>
            </div>

            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Hamiltoniano</span>
              <div v-if="typeof analysis.isHamiltonian === 'string'">
                <span class="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs font-bold border border-slate-200 cursor-help" :title="analysis.isHamiltonian">
                  ⚠️ {{ analysis.isHamiltonian }}
                </span>
              </div>
              <div v-else>
                <span v-if="analysis.isHamiltonian" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold border border-green-200">
                  Sí
                </span>
                <span v-else class="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-200">
                  No
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
            Conectividad
          </div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Componentes conexas</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ analysis.cc }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Vértices aislados</span>
              <span class="text-xl font-mono font-bold text-slate-900">{{ analysis.isolated }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-slate-600 font-medium">Es conexo</span>
              <span class="px-2 py-1 rounded text-xs font-bold border" 
                :class="analysis.isConnected 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-50 text-red-600 border-red-200'">
                {{ analysis.isConnected ? 'Sí' : 'No' }}
              </span>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 border border-purple-100 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-purple-700 uppercase tracking-wide mb-3 border-b border-purple-100 pb-2">Grafo Complementario</div>
          <div class="space-y-3">
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-purple-800 font-medium">Orden (Vértices)</span>
              <span class="text-xl font-mono font-bold text-purple-900">{{ analysis.orden }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-purple-800 font-medium">Medida</span>
              <span class="text-xl font-mono font-bold text-purple-900">{{ analysis.compSize }}</span>
            </div>
            <div class="flex justify-between items-baseline gap-4">
              <span class="text-sm text-purple-800 font-medium">Componentes conexas</span>
              <span class="text-xl font-mono font-bold text-purple-900">{{ analysis.compCc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>