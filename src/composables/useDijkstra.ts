export interface DijkstraStep {
	step: number;
	dists: (number | string)[];
	pivot: string;
	changes: number[];
}

export interface DijkstraResult {
	steps: DijkstraStep[];
	cost: number | string;
	path: string;
	pathArr: string[];
}

const formatPath = (indices: number[], labels: string[]): string[] =>
	indices.map((idx) => labels[idx]);

export const computeDijkstra = (
	matrix: number[][],
	nodeLabels: string[],
	startLabel: string,
	endLabel: string
): DijkstraResult => {
	const n = matrix.length;
	const startIdx = nodeLabels.indexOf(startLabel);
	const endIdx = nodeLabels.indexOf(endLabel);
	if (startIdx < 0 || endIdx < 0) {
		return {
			steps: [],
			cost: "Inalcanzable",
			path: "No existe camino",
			pathArr: [],
		};
	}

	const dist = new Array(n).fill(Infinity);
	const visited = new Array(n).fill(false);
	const parent: Array<number | null> = new Array(n).fill(null);
	const steps: DijkstraStep[] = [];

	dist[startIdx] = 0;

	for (let i = 0; i < n; i++) {
		let u = -1;
		let minVal = Infinity;

		for (let v = 0; v < n; v++) {
			if (!visited[v] && dist[v] < minVal) {
				minVal = dist[v];
				u = v;
			}
		}

		if (u === -1) {
			steps.push({
				step: i,
				dists: dist.map((d) => (d === Infinity ? "∞" : d)),
				pivot: "-",
				changes: [],
			});
			break;
		}

		visited[u] = true;
		const stepChanges: number[] = [];

		for (let v = 0; v < n; v++) {
			if (!visited[v] && matrix[u][v] !== Infinity && dist[u] !== Infinity) {
				if (dist[u] + matrix[u][v] < dist[v]) {
					dist[v] = dist[u] + matrix[u][v];
					parent[v] = u;
					stepChanges.push(v);
				}
			}
		}

		steps.push({
			step: i,
			dists: dist.map((d) => (d === Infinity ? "∞" : d)),
			pivot: nodeLabels[u] ?? "-",
			changes: stepChanges,
		});
	}

	if (dist[endIdx] === Infinity) {
		return {
			steps,
			cost: "Inalcanzable",
			path: "No existe camino",
			pathArr: [],
		};
	}

	let curr: number | null = endIdx;
	const pathIndices: number[] = [];
	while (curr !== null) {
		pathIndices.push(curr);
		curr = parent[curr];
	}
	pathIndices.reverse();

	const pathArr = formatPath(pathIndices, nodeLabels);

	return {
		steps,
		cost: dist[endIdx],
		path: pathArr.join(" → "),
		pathArr,
	};
};
