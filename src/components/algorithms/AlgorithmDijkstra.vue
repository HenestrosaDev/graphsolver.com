<script setup lang="ts">
import { ref, watch } from "vue";
import { useGraph } from "../../composables/useGraph";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";

interface DijkstraStep {
	step: number;
	dists: (number | string)[];
	pivot: string;
	changes: number[]; // Indices that changed in this step
}

const {
	getGraphData,
	nodes,
	toIdx,
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

const solveDijkstra = () => {
	// Initial synchronous cleanup
	isSolved.value = false;
	clearHighlights();

	const { n, matrix } = getGraphData();

	// Validations
	if (toIdx(startNode.value) >= n) startNode.value = nodes.value[0];
	if (toIdx(endNode.value) >= n)
		endNode.value = nodes.value[n - 1] || nodes.value[0];

	const sIdx = toIdx(startNode.value);
	const eIdx = toIdx(endNode.value);

	const dist = new Array(n).fill(Infinity);
	const visited = new Array(n).fill(false);
	const parent = new Array(n).fill(null);

	dist[sIdx] = 0;
	steps.value = [];

	// --- Dijkstra logic (synchronous) ---
	for (let i = 0; i < n; i++) {
		let u = -1;
		let minVal = Infinity;

		// Find the node with the smallest distance that hasn't been visited
		for (let v = 0; v < n; v++) {
			if (!visited[v] && dist[v] < minVal) {
				minVal = dist[v];
				u = v;
			}
		}

		// If no reachable node, we finish but save the state
		if (u === -1) {
			const currentDistDisplay = dist.map((d) => (d === Infinity ? "∞" : d));
			steps.value.push({
				step: i,
				dists: currentDistDisplay,
				pivot: "-",
				changes: [],
			});
			break;
		}

		visited[u] = true;
		const stepChanges: number[] = [];

		// Relax edges
		for (let v = 0; v < n; v++) {
			if (!visited[v] && matrix[u][v] !== Infinity && dist[u] !== Infinity) {
				if (dist[u] + matrix[u][v] < dist[v]) {
					dist[v] = dist[u] + matrix[u][v];
					parent[v] = u;
					stepChanges.push(v); // Register changes for the UI
				}
			}
		}

		const currentDistDisplay = dist.map((d) => (d === Infinity ? "∞" : d));
		const pivotChar = nodes.value[u];

		steps.value.push({
			step: i,
			dists: currentDistDisplay,
			pivot: pivotChar,
			changes: stepChanges,
		});
	}

	// --- Final result ---
	if (dist[eIdx] === Infinity) {
		finalCost.value = "Inalcanzable";
		finalPath.value = "No existe camino";
	} else {
		finalCost.value = dist[eIdx];

		// Reconstructing path
		let curr: number | null = eIdx;
		let pathArr: string[] = [];
		while (curr !== null) {
			pathArr.push(nodes.value[curr]);
			curr = parent[curr];
		}

		// Invert to have order A -> B -> C
		pathArr = pathArr.reverse();

		finalPath.value = pathArr.join(" → ");

		// Send the path to the visual graph
		setHighlightPath(pathArr);
	}

	isSolved.value = true;
};

watch([rawMatrix, numNodes, startNode, endNode], () => solveDijkstra(), {
	deep: true,
	immediate: true,
});
</script>

<template>
	<div class="space-y-8">
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
							class="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
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
							class="bg-white border border-slate-300 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
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

		<div v-if="isSolved">
			<h3 class="text-eyebrow">Tabla de iteraciones</h3>

			<div
				class="bg-white border border-slate-200 rounded-lg overflow-x-auto shadow-sm"
			>
				<table class="w-full text-sm">
					<thead class="bg-slate-50 border-b border-slate-200">
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

					<tbody class="divide-y divide-slate-100">
						<tr
							v-for="row in steps"
							:key="row.step"
							class="hover:bg-slate-50 transition-colors"
						>
							<td class="px-4 py-3 font-medium text-slate-900">
								Paso {{ row.step }}
							</td>

							<td
								v-for="(val, idx) in row.dists"
								:key="idx"
								class="px-4 py-3 text-center tabular-nums"
								:class="{
									'font-bold text-green-600': row.changes.includes(idx),
									'text-slate-600': !row.changes.includes(idx) && val !== '∞',
									'text-slate-300': val === '∞',
								}"
							>
								{{ val }}
							</td>

							<td class="px-4 py-3 text-center">
								<span
									v-if="row.pivot !== '-'"
									class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 border-2 border-blue-500 text-slate-900 font-medium text-sm"
								>
									{{ row.pivot }}
								</span>
								<span v-else class="text-slate-300">-</span>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
