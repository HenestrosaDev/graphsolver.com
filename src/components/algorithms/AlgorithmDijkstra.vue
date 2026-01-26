<script setup lang="ts">
import { ref, watch, onUnmounted, onActivated, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import { computeDijkstra, type DijkstraStep } from "../../composables/useDijkstra";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";

const { getGraphData, nodes, rawMatrix, numNodes, setHighlightPath, clearHighlights } = useGraph();

const startNode = ref<string>("A");
const endNode = ref<string>("B");
const steps = ref<DijkstraStep[]>([]);
const finalCost = ref<number | null>(null);
const finalPath = ref<string | null>(null);
const isSolved = ref(false);
const lastPathArr = ref<string[]>([]);
const resultStatus = ref<"ok" | "unreachable">("ok");
const { t } = useI18n();

const safeStartNode = computed(() => {
	const available = nodes.value;
	if (!available.length) return startNode.value;
	return available.includes(startNode.value) ? startNode.value : available[0];
});

const safeEndNode = computed(() => {
	const available = nodes.value;
	if (!available.length) return endNode.value;
	return available.includes(endNode.value) ? endNode.value : available[available.length - 1];
});

const solveDijkstra = () => {
	isSolved.value = false;
	clearHighlights();
	const { matrix } = getGraphData();
	const result = computeDijkstra(matrix, nodes.value, safeStartNode.value, safeEndNode.value);

	steps.value = result.steps;
	finalCost.value = result.cost;
	finalPath.value = result.path;
	resultStatus.value = result.status;
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

const costDisplay = computed(() => (resultStatus.value === "ok" ? finalCost.value : t("dijkstra.unreachableCost")));

const pathDisplay = computed(() =>
	resultStatus.value === "ok" && finalPath.value ? finalPath.value : t("dijkstra.noPath"),
);

watch(
	nodes,
	(newNodes) => {
		if (!newNodes.length) return;
		if (!newNodes.includes(startNode.value)) startNode.value = newNodes[0];
		if (!newNodes.includes(endNode.value)) endNode.value = newNodes[newNodes.length - 1];
	},
	{ immediate: true },
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
			<h3 class="text-eyebrow">
				{{ t("dijkstra.routeTitle") }}
			</h3>

			<PropertiesCard>
				<template #header>
					<div class="flex w-full flex-wrap items-center justify-between gap-4">
						<div class="flex items-center gap-2">
							<label
								for="start-node"
								class="text-xs font-bold tracking-wide uppercase"
							>
								{{ t("dijkstra.origin") }}
							</label>
							<select
								id="start-node"
								v-model="startNode"
								class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
							>
								<option
									v-for="n in nodes"
									:key="n"
									:value="n"
								>
									{{ n }}
								</option>
							</select>
						</div>

						<div class="text-lg text-slate-400">
							→
						</div>

						<div class="flex items-center gap-2">
							<label
								for="end-node"
								class="text-xs font-bold tracking-wide uppercase"
							>
								{{ t("dijkstra.destination") }}
							</label>
							<select
								id="end-node"
								v-model="endNode"
								class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
							>
								<option
									v-for="n in nodes"
									:key="n"
									:value="n"
								>
									{{ n }}
								</option>
							</select>
						</div>
					</div>
				</template>

				<template v-if="isSolved">
					<PropertyRow
						:label="t('dijkstra.minCost')"
						:value="costDisplay"
						:variant="resultStatus === 'ok' ? 'metric' : 'badge'"
					/>
					<PropertyRow
						:label="t('dijkstra.optimalPath')"
						:value="pathDisplay"
						:variant="resultStatus === 'ok' ? 'metric' : 'badge'"
					/>
				</template>
			</PropertiesCard>
		</div>

		<div v-if="isSolved">
			<h3 class="text-eyebrow">
				{{ t("dijkstra.iterationsTable") }}
			</h3>

			<div
				class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
			>
				<table class="w-full text-sm">
					<thead class="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
						<tr>
							<th class="px-4 py-3 text-left">
								{{ t("dijkstra.iteration") }}
							</th>
							<th
								v-for="n in nodes"
								:key="n"
								class="w-12 px-4 py-3 text-center font-bold"
							>
								{{ n }}
							</th>
							<th class="px-4 py-3 text-center text-blue-600">
								{{ t("dijkstra.pivot") }}
							</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
						<tr
							v-for="row in steps"
							:key="row.step"
							class="hover:bg-slate-50 dark:hover:bg-slate-800"
						>
							<td class="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
								{{ t("dijkstra.stepLabel", { step: row.step }) }}
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
									class="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-50 text-sm font-medium text-slate-900 dark:border-blue-400 dark:bg-blue-900/40 dark:text-slate-100"
								>
									{{ row.pivot }}
								</span>
								<span
									v-else
									class="text-slate-300 dark:text-slate-600"
								>-</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
