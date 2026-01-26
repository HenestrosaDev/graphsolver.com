import type { FloydStep } from "../types/graph";

export interface FloydResult {
	steps: FloydStep[];
	dist: number[][];
	next: (number | null)[][];
	diameter: number;
	hasInfPairs: boolean;
}

const cloneMatrix = (matrix: number[][]): number[][] => matrix.map((row) => [...row]);

export const computeFloyd = (matrix: number[][], __nodeLabels: string[] = []): FloydResult => {
	const n = matrix.length;
	const dist: number[][] = cloneMatrix(matrix);

	for (let i = 0; i < n; i++) {
		dist[i][i] = 0;
	}

	const next: (number | null)[][] = Array.from({ length: n }, (_, i) =>
		Array.from({ length: n }, (_, j) => (dist[i][j] !== Infinity && i !== j ? j : null)),
	);

	const steps: FloydStep[] = [
		{
			matrix: cloneMatrix(dist),
			pivot: -1,
			k: 0,
		},
	];

	for (let k = 0; k < n; k++) {
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (dist[i][k] + dist[k][j] < dist[i][j]) {
					dist[i][j] = dist[i][k] + dist[k][j];
					next[i][j] = next[i][k];
				}
			}
		}
		steps.push({
			matrix: cloneMatrix(dist),
			pivot: k,
			k,
		});
	}

	let maxD = 0;
	let infFound = false;
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (i === j) continue;
			if (dist[i][j] === Infinity) {
				infFound = true;
				continue;
			}
			if (dist[i][j] > maxD) maxD = dist[i][j];
		}
	}

	return {
		steps,
		dist,
		next,
		diameter: maxD,
		hasInfPairs: infFound,
	};
};
