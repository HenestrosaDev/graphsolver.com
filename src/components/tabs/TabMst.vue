<script setup lang="ts">
import { ref } from 'vue';
import { useGraph } from '../../composables/useGraph';
import { useToast } from '../../composables/useToast';
import type { MSTResult } from '../../types/graph';

const { getGraphData, nodes } = useGraph();
const { triggerToast } = useToast();

const result = ref<MSTResult | null>(null);

// Clase auxiliar Union-Find
class UnionFind {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i: number): number {
    if (this.parent[i] === i) return i;
    return (this.parent[i] = this.find(this.parent[i]));
  }
  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
      return true;
    }
    return false;
  }
}

const solveMST = () => {
  const { n, matrix } = getGraphData();
  
  // 1. Obtener todas las aristas
  interface Edge { u: number; v: number; w: number; id: string }
  let edges: Edge[] = [];
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== Infinity) {
        edges.push({ 
          u: i, 
          v: j, 
          w: matrix[i][j], 
          id: `${nodes.value[i]}${nodes.value[j]}` 
        });
      }
    }
  }

  // 2. Ordenar: Menor peso -> Orden Alfabético
  edges.sort((a, b) => (a.w !== b.w) ? a.w - b.w : a.id.localeCompare(b.id));

  // 3. Kruskal Principal
  const uf = new UnionFind(n);
  const mstEdges: Edge[] = [];
  let mstCost = 0;

  for (const e of edges) {
    if (uf.union(e.u, e.v)) {
      mstEdges.push(e);
      mstCost += e.w;
    }
  }

  // 4. Formatear salida string
  // Re-ordenar las aristas seleccionadas para visualización limpia
  mstEdges.sort((a, b) => (a.w !== b.w) ? a.w - b.w : a.id.localeCompare(b.id));
  
  const edgeString = mstEdges.map(e => {
    const n1 = nodes.value[e.u];
    const n2 = nodes.value[e.v];
    return n1 < n2 ? n1 + n2 : n2 + n1;
  }).join(",");

  // 5. Chequeo de Unicidad
  // Verificar si el grafo es conexo primero
  let connectedCount = 0;
  const root = uf.find(0);
  for(let i=0; i<n; i++) if(uf.find(i) === root) connectedCount++;

  let uniqueStatus: string | boolean = "SÍ";

  if (connectedCount < n) {
    uniqueStatus = "Grafo no conexo (No existe árbol generador)";
  } else {
    // Intentar encontrar otro MST con el mismo coste quitando una arista del MST original
    let isUnique = true;
    
    for (const edgeToRemove of mstEdges) {
      const ufTest = new UnionFind(n);
      let testCost = 0;
      let edgesCount = 0;
      
      for (const e of edges) {
        if (e === edgeToRemove) continue; // Saltamos la arista actual
        if (ufTest.union(e.u, e.v)) {
          testCost += e.w;
          edgesCount++;
        }
      }
      
      // Si logramos conectar n-1 aristas con el mismo coste
      if (edgesCount === n - 1 && testCost === mstCost) {
        isUnique = false;
        break;
      }
    }
    uniqueStatus = isUnique ? "NO (Es único)" : "SÍ (Existen otros)";
  }

  result.value = {
    cost: mstCost,
    edges: edgeString,
    isUnique: uniqueStatus
  };
};

const copyResult = () => {
  if(result.value) triggerToast();
  navigator.clipboard.writeText(result.value?.edges || '');
};
</script>

<template>
  <div class="animate-fade-in">
    <div class="mb-6 border-b border-gray-100 pb-4">
      <button @click="solveMST" class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded shadow-sm transition">
        Calcular Árbol Generador Mínimo (Kruskal)
      </button>
    </div>

    <div v-if="result" class="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
      
      <div class="bg-white p-4 rounded border-l-4 border-yellow-500 shadow-sm">
        <span class="block text-xs font-bold text-gray-500 uppercase">Coste Mínimo Total</span>
        <span class="text-2xl font-mono text-gray-800">{{ result.cost }}</span>
      </div>

      <div class="bg-white p-4 rounded border-l-4 border-yellow-500 shadow-sm relative group">
        <div class="flex justify-between items-start">
          <div>
            <span class="block text-xs font-bold text-gray-500 uppercase">Aristas (Solución)</span>
            <span class="text-xl font-mono text-gray-800 block mt-1 break-all">{{ result.edges }}</span>
            <span class="text-xs text-gray-400 italic mt-1 block">Ordenadas por peso y alfabéticamente</span>
          </div>
          <button @click="copyResult" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded transition">
            Copiar
          </button>
        </div>
      </div>

      <div class="bg-white p-4 rounded border-l-4 border-yellow-500 shadow-sm">
        <span class="block text-xs font-bold text-gray-500 uppercase">¿Existe otro árbol minimal distinto?</span>
        <span class="text-xl font-mono text-gray-800">{{ result.isUnique }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>