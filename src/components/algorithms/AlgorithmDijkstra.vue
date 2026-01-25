<script setup lang="ts">
import { ref, watch, onUnmounted, onActivated, computed } from "vue";
import { useGraph } from "../../composables/useGraph";
import { computeDijkstra, type DijkstraStep } from "../../composables/useDijkstra";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";

const {
	getGraphData,
	nodes,
	rawMatrix,
	numNodes,
	setHighlightPath,
	clearHighlights,
} = useGraph();

const startNode = ref<string>("A");
const endNode = ref<string>("B");
const steps = ref<DijkstraStep[]>([]);
const finalCost = ref<string | number>("-");
const finalPath = ref<string>("-");
const isSolved = ref(false);
const lastPathArr = ref<string[]>([]);

const safeStartNode = computed(() => {
	const available = nodes.value;
	if (!available.length) return startNode.value;
	return available.includes(startNode.value) ? startNode.value : available[0];
});

const safeEndNode = computed(() => {
	const available = nodes.value;
	if (!available.length) return endNode.value;
	return available.includes(endNode.value)
		? endNode.value
		: available[available.length - 1];
});

const solveDijkstra = () => {
	isSolved.value = false;
	clearHighlights();
	const { matrix } = getGraphData();
	const result = computeDijkstra(
		matrix,
		nodes.value,
		safeStartNode.value,
		safeEndNode.value
	);

	steps.value = result.steps;
	finalCost.value = result.cost;
	finalPath.value = result.path;
	lastPathArr.value = result.pathArr;

	if (result.pathArr && result.pathArr.length >= 2) {
		setHighlightPath(result.pathArr);
	}

	isSolved.value = true;
};

watch([rawMatrix, numNodes, startNode, endNode], () => solveDijkstra(), {
	deep: true,
	immediate: true,
});

watch(
	nodes,
	(newNodes) => {
		if (!newNodes.length) return;
		if (!newNodes.includes(startNode.value)) startNode.value = newNodes[0];
		if (!newNodes.includes(endNode.value))
			endNode.value = newNodes[newNodes.length - 1];
	},
	{ immediate: true }
);

onActivated(() => {
	if (lastPathArr.value.length >= 2) setHighlightPath(lastPathArr.value);
});

onUnmounted(() => {
	clearHighlights();
});
</script>

<template>
	<div class="space-y-8">
		<div>
			<h3 class="text-eyebrow">Cálculo de ruta</h3>

			<PropertiesCard>
				<template #header>
					<div class="flex flex-wrap items-center justify-between gap-4 w-full">
						<div class="flex items-center gap-2">
							<label
								for="start-node"
								class="text-xs font-bold uppercase tracking-wide"
							>
								Origen
							</label>
							<select
								id="start-node"
								v-model="startNode"
								class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-colors"
							>
								<option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>

						<div class="text-lg text-slate-400">→</div>

						<div class="flex items-center gap-2">
							<label
								for="end-node"
								class="text-xs font-bold uppercase tracking-wide"
							>
								Destino
							</label>
							<select
								id="end-node"
								v-model="endNode"
								class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-100 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-colors"
							>
								<option v-for="n in nodes" :key="n" :value="n">{{ n }}</option>
							</select>
						</div>
					</div>
				</template>

				<template v-if="isSolved">
					<PropertyRow
						label="Coste mínimo"
						:value="finalCost"
						:variant="typeof finalCost === 'string' ? 'badge' : 'metric'"
					/>
					<PropertyRow
						label="Camino óptimo"
						:value="finalPath"
						:variant="typeof finalCost === 'string' ? 'badge' : 'metric'"
					/>
				</template>
			</PropertiesCard>
		</div>

		<div v-if="isSolved">
			<h3 class="text-eyebrow">Tabla de iteraciones</h3>

			<div
				class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto shadow-sm transition-colors"
			>
				<table class="w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
						<tr>
							<th class="px-4 py-3 text-left">Iteración</th>
							<th
								v-for="n in nodes"
								:key="n"
								class="px-4 py-3 text-center font-bold w-12"
							>
								{{ n }}
							</th>
							<th class="px-4 py-3 text-center text-blue-600">Pivote</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						<tr
							v-for="row in steps"
							:key="row.step"
							class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
						>
							<td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
								Paso {{ row.step }}
							</td>

							<td
								v-for="(val, idx) in row.dists"
								:key="idx"
								class="px-4 py-3 text-center tabular-nums"
								:class="{
									'font-bold text-green-600 dark:text-green-300': row.changes.includes(idx),
									'text-slate-600 dark:text-slate-300': !row.changes.includes(idx) && val !== '∞',
									'text-slate-300 dark:text-slate-600': val === '∞',
								}"
							>
								{{ val }}
							</td>

							<td class="px-4 py-3 text-center">
								<span
									v-if="row.pivot !== '-'"
									class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 border-2 border-blue-500 dark:border-blue-400 text-slate-900 dark:text-slate-100 font-medium text-sm"
								>
									{{ row.pivot }}
								</span>
								<span v-else class="text-slate-300 dark:text-slate-600">-</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
