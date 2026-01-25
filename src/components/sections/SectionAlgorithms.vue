<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import AlgorithmFloyd from "../algorithms/AlgorithmFloyd.vue";
import AlgorithmKruskal from "../algorithms/AlgorithmKruskal.vue";
import AlgorithmDijkstra from "../algorithms/AlgorithmDijkstra.vue";

const { t } = useI18n();
const selectedAlgorithm = ref<string>("dijkstra");

const algorithms = computed(() => [
	{ id: "dijkstra", label: t("algorithmsSection.options.dijkstra"), component: AlgorithmDijkstra },
	{ id: "floyd", label: t("algorithmsSection.options.floyd"), component: AlgorithmFloyd },
	{ id: "mst", label: t("algorithmsSection.options.mst"), component: AlgorithmKruskal },
]);

const algorithmById = computed(() =>
	Object.fromEntries(algorithms.value.map((a) => [a.id, a.component]))
);
</script>

<template>
	<div>
		<div class="mb-4">
			<label for="algorithm-selector" class="text-eyebrow"> {{ t("algorithmsSection.label") }} </label>
			<select
				id="algorithm-selector"
				v-model="selectedAlgorithm"
				class="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 "
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
