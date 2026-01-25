<script setup lang="ts">
import { ref, computed } from "vue";
import AlgorithmFloyd from "../algorithms/AlgorithmFloyd.vue";
import AlgorithmKruskal from "../algorithms/AlgorithmKruskal.vue";
import AlgorithmDijkstra from "../algorithms/AlgorithmDijkstra.vue";

const selectedAlgorithm = ref<string>("dijkstra");

const algorithms = [
	{ id: "dijkstra", label: "Dijkstra", component: AlgorithmDijkstra },
	{ id: "floyd", label: "Floyd-Warshall", component: AlgorithmFloyd },
	{ id: "mst", label: "Kruskal (MST)", component: AlgorithmKruskal },
];
const algorithmById = computed(() =>
	Object.fromEntries(algorithms.map((a) => [a.id, a.component]))
);
</script>

<template>
	<div>
		<div class="mb-4">
			<label class="text-eyebrow"> Algoritmo </label>
			<select
				v-model="selectedAlgorithm"
				class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
			>
				<option v-for="algo in algorithms" :key="algo.id" :value="algo.id">
					{{ algo.label }}
				</option>
			</select>
		</div>

		<div class="mt-8">
			<KeepAlive>
				<component :is="algorithmById[selectedAlgorithm]" />
			</KeepAlive>
		</div>
	</div>
</template>
