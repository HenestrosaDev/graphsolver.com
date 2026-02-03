import { ref, watch, onMounted, onUnmounted, type Ref } from "vue";
import { Network, type Data, type Edge, type Node } from "vis-network";
import { DataSet } from "vis-data";

export type GraphData = {
	n: number;
	matrix: number[][];
	isSymmetric: boolean;
};

type UseGraphVisualizerOptions = {
	containerRef: Ref<HTMLElement | null>;
	wrapperRef: Ref<HTMLElement | null>;
	getGraphData: () => GraphData;
	nodes: Ref<string[]>;
	highlightedPath: Ref<string[]>;
	isDark: Ref<boolean>;
};

const getNodeColors = (dark: boolean) => ({
	background: dark ? "#1e293b" : "#EFF6FF",
	border: dark ? "#60a5fa" : "#2563EB",
	highlight: dark ? "#3b82f6" : "#BFDBFE",
	hover: {
		background: dark ? "#0f172a" : "#BFDBFE",
		border: dark ? "#60a5fa" : "#2563EB",
	},
});

const getNodeFont = (dark: boolean) => ({
	size: 20,
	face: "ui-sans-serif, system-ui",
	color: dark ? "#f1f5f9" : "#1e293b",
	multi: "md",
	bold: {
		color: dark ? "#f1f5f9" : "#1e293b",
		size: 20,
		face: "ui-sans-serif, system-ui",
		vadjust: 0,
		mod: "bold",
	},
});

const getEdgeColor = (dark: boolean, highlighted: boolean) =>
	highlighted
		? { color: "#ef4444", highlight: "#ef4444" }
		: { color: dark ? "#94a3b8" : "#64748b", highlight: dark ? "#60a5fa" : "#2563EB" };

const getEdgeFont = (dark: boolean) => ({
	align: "middle",
	color: dark ? "#f1f5f9" : "#000000",
	strokeWidth: 0,
	background: dark ? "rgba(30,41,59,0.85)" : "rgba(255,255,255,0.85)",
	size: 14,
});

const getEdgeWidth = (highlighted: boolean) => (highlighted ? 4 : 2);

const createOptions = () => ({
	height: "100%",
	width: "100%",
	physics: {
		enabled: true,
		solver: "repulsion",
		repulsion: {
			nodeDistance: 250,
			centralGravity: 0.2,
			springLength: 250,
			springConstant: 0.05,
			damping: 0.09,
		},
		stabilization: {
			enabled: true,
			iterations: 1000,
			updateInterval: 25,
			fit: true,
		},
	},
	interaction: {
		hover: true,
		zoomView: false,
		dragView: true,
		dragNodes: true,
	},
	layout: { randomSeed: 10 },
});

export const useGraphVisualizer = ({
	containerRef,
	wrapperRef,
	getGraphData,
	nodes,
	highlightedPath,
	isDark,
}: UseGraphVisualizerOptions) => {
	const networkInstance = ref<Network | null>(null);
	const nodesRef = ref<DataSet<Node> | null>(null);
	const edgesRef = ref<DataSet<Edge> | null>(null);
	let resizeObserver: ResizeObserver | null = null;

	const parseData = () => {
		const { n, matrix, isSymmetric } = getGraphData();

		const visNodes = new DataSet<Node>(
			nodes.value.map((label, id) => ({
				id,
				label,
				color: getNodeColors(isDark.value),
				font: getNodeFont(isDark.value),
				shape: "circle",
				borderWidth: 2,
				margin: {
					top: 15,
					bottom: 15,
					left: 15,
					right: 15,
				},
				shadow: { enabled: true, color: "rgba(0,0,0,0.1)", x: 2, y: 2 },
			}))
		);

		const visEdgesArray: Edge[] = [];

		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				if (isSymmetric && j < i) continue;

				const weight = matrix[i][j];

				if (weight !== Infinity) {
					const edgeId = isSymmetric ? [nodes.value[i], nodes.value[j]].sort().join('') : nodes.value[i] + nodes.value[j];
					const isHighlighted = highlightedPath.value.includes(edgeId);

					visEdgesArray.push({
						id: edgeId,
						from: i,
						to: j,
						label: String(weight),
						arrows: isSymmetric ? undefined : { to: { enabled: true, scaleFactor: 1 } },
						color: getEdgeColor(isDark.value, isHighlighted),
						font: getEdgeFont(isDark.value),
						width: getEdgeWidth(isHighlighted),
						smooth: { enabled: true, type: "curvedCW", roundness: 0.2 },
					});
				}
			}
		}

		return { nodes: visNodes, edges: new DataSet<Edge>(visEdgesArray) };
	};

	const rebuildNetwork = () => {
		const container = containerRef.value;
		if (!container) return;

		const { nodes: visNodes, edges: visEdges } = parseData();
		nodesRef.value = visNodes;
		edgesRef.value = visEdges;

		networkInstance.value?.destroy();
		networkInstance.value = new Network(
			container,
			{ nodes: visNodes, edges: visEdges } as unknown as Data,
			createOptions()
		);

		networkInstance.value.on("stabilizationIterationsDone", () => {
			networkInstance.value?.setOptions({ physics: { enabled: false } });
		});

		networkInstance.value.fit();
	};

	const updateHighlights = () => {
		if (!edgesRef.value) return;

		const updatedEdges = edgesRef.value.get().map((edge) => {
			const isHighlighted = highlightedPath.value.includes(edge.id as string);
			return {
				id: edge.id,
				color: getEdgeColor(isDark.value, isHighlighted),
				width: getEdgeWidth(isHighlighted),
			};
		});

		edgesRef.value.update(updatedEdges);
	};

	const updateThemeStyles = () => {
		if (!nodesRef.value || !edgesRef.value) return;

		const nodeUpdates = nodesRef.value.get().map((node) => ({
			id: node.id,
			color: getNodeColors(isDark.value),
			font: getNodeFont(isDark.value),
		}));

		nodesRef.value.update(nodeUpdates);

		const edgeUpdates = edgesRef.value.get().map((edge) => {
			const isHighlighted = highlightedPath.value.includes(edge.id as string);
			return {
				id: edge.id,
				color: getEdgeColor(isDark.value, isHighlighted),
				font: getEdgeFont(isDark.value),
				width: getEdgeWidth(isHighlighted),
			};
		});

		edgesRef.value.update(edgeUpdates);
	};

	const setInteractionLocked = (locked: boolean) => {
		networkInstance.value?.setOptions({
			interaction: {
				zoomView: !locked,
				dragView: true,
				dragNodes: !locked,
			},
		});
	};

	const zoomIn = () =>
		networkInstance.value?.moveTo({
			scale: networkInstance.value.getScale() * 1.2,
			animation: { duration: 200, easingFunction: "easeInOutQuad" },
		});

	const zoomOut = () =>
		networkInstance.value?.moveTo({
			scale: networkInstance.value.getScale() / 1.2,
			animation: { duration: 200, easingFunction: "easeInOutQuad" },
		});

	const fitGraph = () => networkInstance.value?.fit({ animation: true });

	const resizeAndFit = () => {
		networkInstance.value?.setSize("100%", "100%");
		networkInstance.value?.redraw();
		networkInstance.value?.fit();
	};

	const exportImage = () => {
		const container = containerRef.value;
		if (!container || !networkInstance.value) return false;

		const canvas = container.querySelector("canvas");
		if (!canvas) return false;

		const ctx = canvas.getContext("2d");
		if (!ctx) return false;

		ctx.save();
		ctx.globalCompositeOperation = "destination-over";
		ctx.fillStyle = isDark.value ? "#0f172a" : "#ffffff";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		const dataURL = canvas.toDataURL("image/png");
		ctx.restore();

		const link = document.createElement("a");
		link.href = dataURL;
		link.download = `graph-${new Date().getTime()}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		return true;
	};

	onMounted(() => {
		rebuildNetwork();

		if (wrapperRef.value) {
			resizeObserver = new ResizeObserver(() => {
				networkInstance.value?.setSize("100%", "100%");
				networkInstance.value?.redraw();
			});
			resizeObserver.observe(wrapperRef.value);
		}
	});

	onUnmounted(() => {
		resizeObserver?.disconnect();
		networkInstance.value?.destroy();
	});

	watch(highlightedPath, () => updateHighlights(), { deep: true });
	watch(isDark, () => updateThemeStyles());

	return {
		setInteractionLocked,
		zoomIn,
		zoomOut,
		fitGraph,
		exportImage,
		resizeAndFit,
		rebuildNetwork,
	};
};
