<script setup lang="ts">
import { ref, watch } from "vue";
import { useGraph } from "../../composables/useGraph";
import { computeKruskal } from "../../composables/useKruskal";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";
import type { MSTResult } from "../../types/graph";

const { getGraphData, nodes, rawMatrix, numNodes, clearHighlights } =
	useGraph();

const result = ref<MSTResult | null>(null);
const solveMST = () => {
	clearHighlights();
	const { matrix, isSymmetric } = getGraphData();
	if (!isSymmetric) {
		result.value = {
			cost: "No válido",
			edges: "",
			isUnique: "El algoritmo espera un grafo no dirigido",
		};
		return;
	}
	result.value = computeKruskal(matrix, nodes.value);
};

watch([rawMatrix, numNodes], solveMST, { deep: true, immediate: true });
</script>

<template>
	<PropertiesCard v-if="result" title="Resultado">
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
