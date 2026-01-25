<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGraph } from "../../composables/useGraph";
import type { GraphAnalysis } from "../../types/graph";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";

const { getGraphData, nodes, toIdx, rawMatrix, numNodes } = useGraph();
const { t } = useI18n();

const analysis = ref<GraphAnalysis | null>(null);
const adjTarget = ref<string>("A");

const calculateProperties = () => {
	const { n, hasArc, isSymmetric } = getGraphData();
	if (!Number.isFinite(n) || n <= 0) {
		analysis.value = null;
		return;
	}

	let totalArcs = 0;
	let degrees = new Array(n).fill(0);
	let inD = new Array(n).fill(0);

	// 1. Basic Counts & Degrees
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (hasArc[i][j]) {
				totalArcs++;
				degrees[i]++;
				inD[j]++;
			}
		}
	}

	const measure = isSymmetric ? totalArcs / 2 : totalArcs;

	// 2. Adjacency List for Target
	const tIdx = toIdx(adjTarget.value);
	let adjNodes: string[] = [];
	if (tIdx >= 0 && tIdx < n) {
		for (let j = 0; j < n; j++)
			if (hasArc[tIdx][j]) adjNodes.push(nodes.value[j]);
	}
	adjNodes.sort((a, b) => b.localeCompare(a));

	// 3. Isolated Vertices
	let isolated = 0;
	for (let i = 0; i < n; i++) if (degrees[i] + inD[i] === 0) isolated++;

	// 4. Connected Components (BFS)
	const countComponents = (adjacencyMatrix: boolean[][]) => {
		let visited = new Array(n).fill(false);
		let count = 0;
		for (let i = 0; i < n; i++) {
			if (!visited[i]) {
				count++;
				let q = [i];
				visited[i] = true;
				while (q.length) {
					let u = q.shift()!;
					for (let v = 0; v < n; v++) {
						if (
							!visited[v] &&
							(adjacencyMatrix[u][v] || adjacencyMatrix[v][u])
						) {
							visited[v] = true;
							q.push(v);
						}
					}
				}
			}
		}
		return count;
	};

	const cc = countComponents(hasArc);

	// 5. Complementary Graph Stats
	// Calculate max edges based on symmetry
	const maxEdges = isSymmetric ? (n * (n - 1)) / 2 : n * (n - 1);

	const compSize = Math.max(0, maxEdges - measure);

	let compMatrix: boolean[][] = [];
	for (let i = 0; i < n; i++) {
		compMatrix[i] = [];
		for (let j = 0; j < n; j++) compMatrix[i][j] = i !== j && !hasArc[i][j];
	}
	const compCc = countComponents(compMatrix);

	// 6. Density & Completeness
	const density = maxEdges > 0 ? measure / maxEdges : 0;
	const isComplete = n > 1 && measure === maxEdges;

	// 7. Min/Max Degree & Regularity
	const maxDegree = n > 0 ? Math.max(...degrees) : 0;
	const minDegree = n > 0 ? Math.min(...degrees) : 0;
	const isRegular = n > 0 && maxDegree === minDegree;

	// 8. Tree / Forest logic
	const isForest = isSymmetric && measure === n - cc;
	const isTree = isSymmetric && cc === 1 && measure === n - 1;

	// 9. Eulerian logic
	let eulerianType: GraphAnalysis["eulerianType"] = "none";
	if (isSymmetric && measure > 0) {
		const oddDegreeCount = degrees.filter((d) => d % 2 !== 0).length;
		if (oddDegreeCount === 0) eulerianType = "cycle";
		else if (oddDegreeCount === 2) eulerianType = "path";
	}

	// 10. Extended Structure Analysis
	const isConnected = cc === 1;
	const hasCycles = measure >= n - cc + 1;

	let structureType: GraphAnalysis["structureType"] = "disconnected";
	if (isSymmetric) {
		if (!hasCycles && isConnected) structureType = "tree";
		else if (!hasCycles && !isConnected) structureType = "forest";
		else if (hasCycles && isConnected) structureType = "connectedCyclic";
		else structureType = "disconnectedCyclic";
	} else {
		if (isConnected)
			structureType = hasCycles
				? "weakConnectedCyclic"
				: "weakConnectedAcyclic";
		else structureType = "disconnected";
	}

	// 11. Bipartite check (2-coloring over undirected view)
	const isBipartite = (() => {
		const colors = new Array(n).fill(0);
		const hasEdge = (u: number, v: number) => hasArc[u][v] || hasArc[v][u];

		// Self-loops break bipartiteness
		for (let i = 0; i < n; i++) if (hasArc[i][i]) return false;

		for (let i = 0; i < n; i++) {
			if (colors[i] !== 0) continue;
			colors[i] = 1;
			const queue = [i];
			while (queue.length) {
				const u = queue.shift()!;
				for (let v = 0; v < n; v++) {
					if (!hasEdge(u, v)) continue;
					if (colors[v] === 0) {
						colors[v] = -colors[u];
						queue.push(v);
					} else if (colors[v] === colors[u]) {
						return false;
					}
				}
			}
		}

		return true;
	})();

	// 12. Hamiltonian Cycle (Backtracking)
	let isHamiltonian: boolean | "npLimit" = false;
	if (n < 3) isHamiltonian = false;
	else if (n > 12) isHamiltonian = "npLimit";
	else if (!isConnected) isHamiltonian = false;
	else {
		const visited = new Array(n).fill(false);
		const checkHamiltonianRecursive = (u: number, count: number): boolean => {
			if (count === n)
				return isSymmetric ? hasArc[u][0] || hasArc[0][u] : hasArc[u][0];
			for (let v = 0; v < n; v++) {
				const hasEdge = isSymmetric
					? hasArc[u][v] || hasArc[v][u]
					: hasArc[u][v];
				if (hasEdge && !visited[v]) {
					visited[v] = true;
					if (checkHamiltonianRecursive(v, count + 1)) return true;
					visited[v] = false;
				}
			}
			return false;
		};
		visited[0] = true;
		isHamiltonian = checkHamiltonianRecursive(0, 1);
	}

	analysis.value = {
		orden: n,
		medida: measure,
		maxEdges, // <--- Added property here
		isSymmetric,
		adjList: adjNodes.join(","),
		seq: [...degrees].join(","),
		isolated,
		cc,
		compSize,
		compCc,
		density,
		isComplete,
		minDegree,
		maxDegree,
		isRegular,
		isTree,
		isForest,
		eulerianType,
		isConnected,
		hasCycles,
		isBipartite,
		structureType,
		isHamiltonian,
	};
};

const maxMeasureTooltip = computed(() => {
	if (!analysis.value) return "";
	const typeLabel = analysis.value.isSymmetric
		? t("properties.values.undirected")
		: t("properties.values.directed");
	const formula = analysis.value.isSymmetric
		? "<i>n(n-1)</i> / <i>2</i>"
		: "<i>n(n-1)</i>";
	return t("properties.tooltips.maxMeasure", { type: typeLabel, formula });
});

const hamiltonianStatus = computed(() => {
	if (!analysis.value)
		return { text: "", classes: "", title: undefined as string | undefined };
	const value = analysis.value.isHamiltonian;

	if (value === "npLimit") {
		return {
			text: t("properties.values.hamiltonian.npLimit"),
			classes:
				"bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-help",
			title: t("properties.values.hamiltonian.npLimit"),
		};
	}

	if (value) {
		return {
			text: t("properties.values.hamiltonian.yes"),
			classes:
				"bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700",
			title: undefined,
		};
	}

	return {
		text: t("properties.values.hamiltonian.no"),
		classes:
			"bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800",
		title: undefined,
	};
});

watch([rawMatrix, numNodes, adjTarget], () => calculateProperties(), {
	deep: true,
	immediate: true,
});
</script>

<template>
	<div v-if="analysis" class="animate-fade-in">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
			<div class="space-y-4">
				<PropertiesCard :title="t('properties.cardTitles.basic')">
					<PropertyRow
						:label="t('properties.labels.graphType')"
						:value="
							analysis.isSymmetric
								? t('properties.values.undirected')
								: t('properties.values.directed')
						"
					/>

					<PropertyRow
						:label="t('properties.labels.order')"
						:value="analysis.orden"
						:tooltip="t('properties.tooltips.order')"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.measure')"
						:value="analysis.medida"
						:tooltip="t('properties.tooltips.measure')"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.maxMeasure')"
						:value="analysis.maxEdges"
						:tooltip="maxMeasureTooltip"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.density')"
						:value="(analysis.density * 100).toFixed(0) + '%'"
						:tooltip="t('properties.tooltips.density')"
						variant="metric"
					/>
				</PropertiesCard>

				<PropertiesCard :title="t('properties.cardTitles.degrees')">
					<PropertyRow
						:label="t('properties.labels.degreeSequence')"
						:value="analysis.seq"
						:tooltip="t('properties.tooltips.degreeSequence')"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.minDegree')"
						:value="analysis.minDegree"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.maxDegree')"
						:value="analysis.maxDegree"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.regularity')"
						:value="
							analysis.isRegular
								? t('properties.values.regular', { degree: analysis.maxDegree })
								: t('properties.values.notRegular')
						"
						:tooltip="t('properties.tooltips.regularity')"
						variant="badge"
						:badge-class="`${analysis.isRegular ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-900 border-slate-200'}`"
					/>
				</PropertiesCard>
			</div>

			<div class="space-y-4">
				<PropertiesCard :title="t('properties.cardTitles.vertices')">
					<PropertyRow 
						:label="t('properties.labels.adjacentsTo')"
						:value="analysis.adjList || t('common.emptySet')" 
						variant="metric"
						:tooltip="t('properties.tooltips.adjacencyList')"
					>
						<template #label>
							<select
								v-model="adjTarget"
								for="label-vortex"
								class="ml-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none normal-case text-slate-700 dark:text-slate-100"
							>
								<option v-for="n in nodes" :key="n" :value="n">
									{{ n }}
								</option>
							</select>
						</template>
					</PropertyRow>

					<PropertyRow
						:label="t('properties.labels.connectedComponents')"
						:value="analysis.cc"
						:tooltip="t('properties.tooltips.connectedComponents')"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.isolatedVertices')"
						:value="analysis.isolated"
						:tooltip="t('properties.tooltips.isolatedVertices')"
						variant="metric"
					/>

					<PropertyRow
						:label="t('properties.labels.connected')"
						:value="analysis.isConnected ? t('properties.values.yes') : t('properties.values.no')"
						:tooltip="t('properties.tooltips.connected')"
						variant="badge"
						:badge-class="
							analysis.isConnected
								? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
								: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
						"
					/>
				</PropertiesCard>

				<PropertiesCard :title="t('properties.cardTitles.topology')">
					<PropertyRow
						:label="t('properties.labels.structure')"
						:value="t(`properties.values.structure.${analysis.structureType}`)"
						:tooltip="t('properties.tooltips.structure')"
					/>

					<PropertyRow
						:label="t('properties.labels.bipartite')"
						:value="analysis.isBipartite ? t('properties.values.yes') : t('properties.values.no')"
						:tooltip="t('properties.tooltips.bipartite')"
						variant="badge"
						:badge-class="
							analysis.isBipartite
								? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
								: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
						"
					/>

					<PropertyRow
						:label="t('properties.labels.eulerian')"
						:value="t(`properties.values.eulerian.${analysis.eulerianType}`)"
						:tooltip="t('properties.tooltips.eulerian')"
						variant="badge"
						:badge-class="
							analysis.eulerianType !== 'none'
								? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
								: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800'
						"
					/>

					<PropertyRow
						:label="t('properties.labels.hamiltonian')"
						:value="hamiltonianStatus.text"
						:tooltip="t('properties.tooltips.hamiltonian')"
						:badge-class="hamiltonianStatus.classes"
					/>
				</PropertiesCard>

				<PropertiesCard
					:title="t('properties.cardTitles.complementary')"
					:tooltip="t('properties.cardTooltips.complementary')"
					theme="purple"
				>
					<PropertyRow
						:label="t('properties.labels.complementaryOrder')"
						:tooltip="t('properties.tooltips.complementaryOrder')"
						:value="analysis.orden"
						variant="metric"
						theme="purple"
					/>

					<PropertyRow
						:label="t('properties.labels.complementaryMeasure')"
						:tooltip="t('properties.tooltips.complementaryMeasure')"
						:value="analysis.compSize"
						variant="metric"
						theme="purple"
					/>

					<PropertyRow
						:label="t('properties.labels.complementaryConnectedComponents')"
						:tooltip="t('properties.tooltips.complementaryConnectedComponents')"
						:value="analysis.compCc"
						variant="metric"
						theme="purple"
					/>
				</PropertiesCard>
			</div>
		</div>
	</div>
</template>
