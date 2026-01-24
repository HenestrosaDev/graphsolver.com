<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGraph } from '../../composables/useGraph';
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";
import type { MSTResult } from '../../types/graph';

const { getGraphData, nodes, rawMatrix, numNodes, clearHighlights } = useGraph();

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
  clearHighlights();
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
    uniqueStatus = "Grafo no conexo (no existe árbol)";
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
    uniqueStatus = isUnique ? "Sí (único)" : "No (existen variantes)";
  }

  result.value = { cost: mstCost, edges: edgeString, isUnique: uniqueStatus };
};

watch([rawMatrix, numNodes], solveMST, { deep: true, immediate: true });
</script>

<template>
  <PropertiesCard 
		v-if="result"
		title="Resultado"
	>
		<PropertyRow
			label="Coste mínimo"
			tooltip="Coste mínimo para conectar todos los vértices del grafo.<br><br>Cálculo: Tras ejecutar el algoritmo de Kruskal, se ignoran las aristas que formarían ciclos y se suman los pesos de las aristas restantes que conforman el Árbol Generador Mínimo."
			:value="result.cost"
			:variant="typeof result.cost === 'string' ? 'badge' : 'metric'"
		/>

		<PropertyRow
			label="Aristas seleccionadas"
			tooltip="Lista de aristas que forman el Árbol Generador Mínimo, ordenadas por peso y lexicográficamente."
			:value="result.edges ? result.edges : '-'"
			variant="metric"
		/>

		<PropertyRow
			label="Solución única"
			tooltip="Determina si existe otro conjunto de aristas que forme un Árbol Generador Mínimo válido con el mismo coste total."
			:value="result.isUnique"
			variant="badge"
		/>
  </PropertiesCard>
</template>