<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useGraph } from "../../composables/useGraph";
import type { GraphAnalysis } from "../../types/graph";
import PropertiesCard from "../properties/PropertiesCard.vue";
import PropertyRow from "../properties/PropertyRow.vue";

const { getGraphData, nodes, toIdx, rawMatrix, numNodes } = useGraph();

const analysis = ref<GraphAnalysis | null>(null);
const adjTarget = ref<string>("A");

const calculateProperties = () => {
	const { n, hasArc, isSymmetric } = getGraphData();
	if (!Number.isFinite(n) || n <= 0) {
		analysis.value = null;
		return;
	}

	// Validate target
	if (toIdx(adjTarget.value) >= n && nodes.value.length)
		adjTarget.value = nodes.value[0];

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
	let eulerianType = "No";
	if (isSymmetric && measure > 0) {
		const oddDegreeCount = degrees.filter((d) => d % 2 !== 0).length;
		if (oddDegreeCount === 0) eulerianType = "Ciclo";
		else if (oddDegreeCount === 2) eulerianType = "Camino";
	}

	// 10. Extended Structure Analysis
	const isConnected = cc === 1;
	const hasCycles = measure >= n - cc + 1;

	let structureType = "Desconocido";
	if (isSymmetric) {
		if (!hasCycles && isConnected) structureType = "Árbol";
		else if (!hasCycles && !isConnected) structureType = "Bosque";
		else if (hasCycles && isConnected) structureType = "Cíclico conexo";
		else structureType = "Disconexo con ciclos";
	} else {
		if (isConnected)
			structureType = hasCycles
				? "Conexo (débil) con ciclos"
				: "DAG Conexo (Débil)";
		else structureType = "Disconexo";
	}

	// 11. Hamiltonian Cycle (Backtracking)
	let isHamiltonian: boolean | string = false;
	if (n < 3) isHamiltonian = false;
	else if (n > 12) isHamiltonian = "NP-Limit (>12)";
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
		structureType,
		isHamiltonian,
	};
};

const hamiltonianStatus = computed(() => {
	const value = analysis.value!.isHamiltonian;

	// Case 1: Error/Warning (string)
	if (typeof value === "string") {
		return {
			text: value,
			// Slate color with cursor-help for the warning tooltip
			classes: "bg-slate-100 text-slate-500 border-slate-200 cursor-help",
			title: value,
		};
	}

	// Case 2: Boolean True
	if (value) {
		return {
			text: "Sí",
			classes: "bg-green-100 text-green-700 border-green-200",
			title: undefined,
		};
	}

	// Case 3: Boolean False
	return {
		text: "No",
		classes: "bg-red-50 text-red-600 border-red-200",
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
				<PropertiesCard title="Propiedades básicas">
					<PropertyRow
						label="Tipo de grafo"
						:value="
							analysis.isSymmetric
								? 'No dirigido (simétrico)'
								: 'Dirigido (asimétrico)'
						"
					/>

					<PropertyRow
						label="Orden"
						:value="analysis.orden"
						tooltip="Número de vértices del grafo. Se denota como <i>n</i>."
						variant="metric"
					/>

					<PropertyRow
						label="Medida"
						:value="analysis.medida"
						tooltip="Número de aristas del grafo. Se denota como <i>m</i>.<br><br><b>Nota</b>: En grafos no dirigidos, cada arista se cuenta una sola vez."
						variant="metric"
					/>

					<PropertyRow
						label="Medida máxima"
						:value="analysis.maxEdges"
						:tooltip="`Número máximo de aristas (<i>m<sub>max</sub></i>) posibles para este grafo ${analysis.isSymmetric ? 'no dirigido' : 'dirigido'}.<br><br><b>Fórmula</b>: ${analysis.isSymmetric ? '<i>n(n-1)</i> / <i>2</i>' : '<i>n(n-1)</i>'}`"
						variant="metric"
					/>

					<PropertyRow
						label="Densidad"
						:value="(analysis.density * 100).toFixed(0) + '%'"
						tooltip="Proporción de aristas existentes (<i>m</i>) frente al máximo posible (<i>m<sub>max</sub></i>). Un 100% indica un <b>grafo completo</b> (<i>K<sub>n</sub></i>).<br><br><b>Fórmula</b>: <i>m</i> / <i>m<sub>max</sub></i>"
						variant="metric"
					/>
				</PropertiesCard>

				<PropertiesCard title="Grados">
					<PropertyRow
						label="Secuencia de grados"
						:value="analysis.seq"
						tooltip="Lista de grados de cada vértice en orden.<br><br><b>Definición</b>: El grado de un vértice es el número de aristas que inciden en él."
						variant="metric"
					/>

					<PropertyRow
						label="Grado mínimo (δ)"
						:value="analysis.minDegree"
						variant="metric"
					/>

					<PropertyRow
						label="Grado máximo (Δ)"
						:value="analysis.maxDegree"
						variant="metric"
					/>

					<PropertyRow
						label="Regularidad"
						:value="`${analysis.isRegular ? analysis.maxDegree + '-Regular' : 'No regular'}`"
						tooltip="Un grafo es <b>regular</b> si todos sus vértices tienen el mismo grado. En ese caso, se denomina <i>k-Regular</i>, siendo <i>k</i> el grado común."
						variant="badge"
						:badge-class="`${analysis.isRegular ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-900 border-slate-200'}`"
					/>
				</PropertiesCard>
			</div>

			<div class="space-y-4">
				<PropertiesCard title="Vértices">
					<PropertyRow 
						label="Adyacentes a"
						:value="analysis.adjList || '∅'" 
						variant="metric"
						tooltip="Muestra los vértices conectados directamente al vértice seleccionado."
					>
						<template #label>
							<select
								v-model="adjTarget"
								for="label-vortex"
								class="ml-0.5 bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none normal-case text-slate-700"
							>
								<option v-for="n in nodes" :key="n" :value="n">
									{{ n }}
								</option>
							</select>
						</template>
					</PropertyRow>

					<PropertyRow
						label="Componentes conexas"
						:value="analysis.cc"
						tooltip="Número de componentes conexas dentro del grafo. Se calcula mediante algoritmos de búsqueda en profundidad (DFS) o búsqueda en anchura (BFS).<br><br><b>Definición</b>: Una componente conexa es un subgrafo en el que cualquier par de vértices están conectados entre sí por caminos, y que no está conectado a ningún vértice fuera del subgrafo."
						variant="metric"
					/>

					<PropertyRow
						label="Vértices aislados"
						:value="analysis.isolated"
						tooltip="Número de vértices que no están conectados a ningún otro vértice dentro del grafo."
						variant="metric"
					/>

					<PropertyRow
						label="Conexo"
						:value="analysis.isConnected ? 'Sí' : 'No'"
						tooltip="Indica si existe un camino entre cualquier par de vértices."
						variant="badge"
						:badge-class="
							analysis.isConnected
								? 'bg-green-100 text-green-700 border-green-200'
								: 'bg-red-50 text-red-600 border-red-200'
						"
					/>
				</PropertiesCard>

				<PropertiesCard title="Topología">
					<PropertyRow
						label="Clasificación estructural"
						:value="analysis.structureType"
						tooltip="Descripción del tipo de grafo según su estructura y propiedades básicas."
					/>

					<PropertyRow
						label="Euleriano"
						:value="analysis.eulerianType"
						tooltip="Un grafo es <b>euleriano</b> si contiene un ciclo que recorre todas las aristas exactamente una vez.<br><br><b>Dificultad computacional:</b> Determinar si un grafo es euleriano es un problema polinomialmente resoluble (P). <br><br><b>Tipos:</b><br>• <b>Ciclo</b>: Todos los vértices tienen grado par.<br>• <b>Camino</b>: Exactamente dos vértices tienen grado impar.<br>• <b>No</b>: No cumple las condiciones anteriores."
						variant="badge"
						:badge-class="
							analysis.eulerianType !== 'No'
								? 'bg-green-100 text-green-700 border-green-200'
								: 'bg-red-50 text-red-600 border-red-200'
						"
					/>

					<PropertyRow
						label="Hamiltoniano"
						:value="hamiltonianStatus.text"
						tooltip=" Un grafo es <b>hamiltoniano</b> si contiene un ciclo que visita cada vértice exactamente una vez.<br><br><b>Dificultad computacional:</b> Determinar si un grafo es hamiltoniano es un problema NP-completo. <br><br><b>Nota</b>: No se realizará el análisis para grafos con más de 12 vértices debido a limitaciones computacionales."
						:badge-class="hamiltonianStatus.classes"
					/>
				</PropertiesCard>

				<PropertiesCard
					title="Grafo complementario"
					tooltip='El grafo complementario <span style="text-decoration: overline;">G</span> tiene los mismos vértices que el original, pero sus aristas son exactamente los pares de vértices que no son adyacentes (no tienen arista directa) en el grafo base. Es como el "negativo" del grafo base: donde ahora hay camino, desaparece, y donde no lo hay, aparece.'
					theme="purple"
				>
					<PropertyRow
						label="Orden"
						tooltip="Número de aristas del grafo complementario. Tiene el mismo orden que el grafo original."
						:value="analysis.orden"
						variant="metric"
						theme="purple"
					/>

					<PropertyRow
						label="Medida"
						tooltip="Número de aristas del grafo complementario.<br><br><b>Fórmula:</b> <i>m<sub><span style='text-decoration: overline;'>G</span></sub></i> = <i>m<sub>max</sub></i> - <i>m<sub>G</sub></i>"
						:value="analysis.compSize"
						variant="metric"
						theme="purple"
					/>

					<PropertyRow
						label="Componentes conexas"
						tooltip="Las componentes conexas de <i><span style='text-decoration: overline;'>G</span></i> son los subgrafos independientes que se forman al trazar las aristas que faltaban en el original. Si en el grafo original dos grupos estaban totalmente aislados, en el complementario esos grupos se fusionan."
						:value="analysis.compCc"
						variant="metric"
						theme="purple"
					/>
				</PropertiesCard>
			</div>
		</div>
	</div>
</template>
