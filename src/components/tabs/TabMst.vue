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
    <!-- Results Cards -->
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Coste Mínimo (Kruskal)</div>
          <div class="text-3xl font-mono font-bold text-slate-900">{{ result.cost }}</div>
        </div>

        <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">¿Solución Única?</div>
          <div class="text-lg font-bold text-slate-700">{{ result.isUnique }}</div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Aristas Seleccionadas</div>
            <div class="text-lg font-mono text-blue-600 font-medium break-all">{{ result.edges || '-' }}</div>
          </div>
          <button
            @click="copyResult"
            class="ml-4 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 rounded-md transition font-medium flex items-center gap-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            Copiar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>