import { describe, it, expect } from "vitest";
import { computeFloyd } from "../useFloyd";
import { computeDijkstra } from "../useDijkstra";
import { computeKruskal } from "../useKruskal";

const nodes = ["A", "B", "C"];

describe("computeFloyd", () => {
	it("should compute shortest paths and diameter", () => {
		const matrix = [
			[0, 3, Infinity],
			[3, 0, 1],
			[Infinity, 1, 0],
		];
		const { dist, diameter } = computeFloyd(matrix, nodes);
		expect(dist[0][2]).toBe(4);
		expect(dist[0][1]).toBe(3);
		expect(diameter).toBe(4);
	});
});

describe("computeDijkstra", () => {
	it("should return path and cost", () => {
		const matrix = [
			[0, 2, 5],
			[2, 0, 1],
			[5, 1, 0],
		];
		const result = computeDijkstra(matrix, nodes, "A", "C");
		expect(result.cost).toBe(3);
		expect(result.pathArr).toEqual(["A", "B", "C"]);
	});
});

describe("computeKruskal", () => {
	it("should build MST with minimum cost", () => {
		const matrix = [
			[0, 2, 3],
			[2, 0, 1],
			[3, 1, 0],
		];
		const result = computeKruskal(matrix, nodes);
		expect(result.cost).toBe(3);
		expect(result.edges).toContain("AB");
		expect(result.edges).toContain("BC");
	});
});
