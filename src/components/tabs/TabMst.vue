<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';
import { useToast } from '../../composables/useToast';
import type { MSTResult } from '../../types/graph';

const { getGraphData, nodes, rawMatrix, numNodes } = useGraph();
const { triggerToast } = useToast();

const result = ref<MSTResult | null>(null);

class UnionFind {
  parent: number[];
  constructor(n: number) { this.parent = Array.from({ length: n }, (_, i) => i); }
  find(i: number): number {
    if (this.parent[i] === i) return i;
    return (this.parent[i] = this.find(this.parent[i]));
  }
  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) { this.parent[rootI] = rootJ; return true; }
    return false;
  }
}

const solveMST = () => {
  const { n, matrix } = getGraphData();
  
  interface Edge { u: number; v: number; w: number; id: string }
  let edges: Edge[] = [];
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== Infinity) {
        edges.push({ u: i, v: j, w: matrix[i][j], id: `${nodes.value[i]}${nodes.value[j]}` });
      }
    }
  }

  edges.sort((a, b) => (a.w !== b.w) ? a.w - b.w : a.id.localeCompare(b.id));

  const uf = new UnionFind(n);
  const mstEdges: Edge[] = [];
  let mstCost = 0;

  for (const e of edges) {
    if (uf.union(e.u, e.v)) { mstEdges.push(e); mstCost += e.w; }
  }

  mstEdges.sort((a, b) => (a.w !== b.w) ? a.w - b.w : a.id.localeCompare(b.id));
  
  const edgeString = mstEdges.map(e => {
    const n1 = nodes.value[e.u];
    const n2 = nodes.value[e.v];
    return n1 < n2 ? n1 + n2 : n2 + n1;
  }).join(", ");

  // Unicidad
  let connectedCount = 0;
  const root = uf.find(0);
  for(let i=0; i<n; i++) if(uf.find(i) === root) connectedCount++;

  let uniqueStatus: string | boolean = "SÍ";

  if (connectedCount < n) {
    uniqueStatus = "Grafo no conexo (No existe árbol)";
  } else {
    let isUnique = true;
    for (const edgeToRemove of mstEdges) {
      const ufTest = new UnionFind(n);
      let testCost = 0;
      let edgesCount = 0;
      for (const e of edges) {
        if (e === edgeToRemove) continue;
        if (ufTest.union(e.u, e.v)) { testCost += e.w; edgesCount++; }
      }
      if (edgesCount === n - 1 && testCost === mstCost) { isUnique = false; break; }
    }
    uniqueStatus = isUnique ? "SÍ (Único)" : "NO (Existen variantes)";
  }

  result.value = { cost: mstCost, edges: edgeString, isUnique: uniqueStatus };
};

const copyResult = () => {
  if(result.value) triggerToast();
  navigator.clipboard.writeText(result.value?.edges || '');
};

watch([rawMatrix, numNodes], solveMST, { deep: true, immediate: true });
</script>

<template>
  <div class="animate-fade-in" v-if="result">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
      
      <div class="bg-white p-4 rounded border-l-4 border-yellow-400 shadow-sm">
        <span class="block text-xs font-bold text-gray-400 uppercase">Coste Mínimo (Kruskal)</span>
        <span class="text-3xl font-mono font-bold text-gray-800">{{ result.cost }}</span>
      </div>

      <div class="bg-white p-4 rounded border-l-4 border-yellow-400 shadow-sm relative group">
        <div class="flex justify-between items-start">
          <div>
            <span class="block text-xs font-bold text-gray-400 uppercase">Aristas Seleccionadas</span>
            <span class="text-lg font-mono text-blue-600 block mt-1 break-all font-bold">{{ result.edges || '-' }}</span>
          </div>
          <button @click="copyResult" class="text-xs bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 px-3 py-1 rounded transition font-medium">
            Copiar
          </button>
        </div>
      </div>

      <div class="bg-white p-4 rounded border-l-4 border-yellow-400 shadow-sm">
        <span class="block text-xs font-bold text-gray-400 uppercase">¿Es solución única?</span>
        <span class="text-lg font-bold text-gray-700">{{ result.isUnique }}</span>
      </div>
    </div>
  </div>
</template>