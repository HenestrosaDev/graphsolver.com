import { useGraph } from "./useGraph";

export type FormatKey = "JSON" | "LaTeX" | "Dot" | "GraphML";

export interface GraphFormat {
	serialize: () => string;
	parse: (value: string) => boolean;
	mime: string;
	ext: string;
	accept: string;
}

export const useGraphFormats = () => {
	const { toJSON, toLaTeX, toDot, toGraphML, loadFromJSON, loadFromLaTeX, loadFromDot, loadFromGraphML } =
		useGraph();

	const formats: Record<FormatKey, GraphFormat> = {
		JSON: {
			serialize: toJSON,
			parse: loadFromJSON,
			mime: "application/json",
			ext: "json",
			accept: ".json",
		},
		LaTeX: {
			serialize: toLaTeX,
			parse: loadFromLaTeX,
			mime: "text/plain",
			ext: "tex",
			accept: ".tex",
		},
		Dot: {
			serialize: toDot,
			parse: loadFromDot,
			mime: "text/plain",
			ext: "dot",
			accept: ".dot,.gv",
		},
		GraphML: {
			serialize: toGraphML,
			parse: loadFromGraphML,
			mime: "application/xml",
			ext: "graphml",
			accept: ".graphml,.xml",
		},
	};

	const formatOrder: FormatKey[] = ["JSON", "LaTeX", "Dot", "GraphML"];

	const getFormatByExtension = (filename: string): FormatKey | undefined => {
		const ext = filename.split(".").pop()?.toLowerCase();
		if (!ext) return undefined;

		return Object.entries(formats).find(([_, config]) =>
			config.accept
				.split(",")
				.map((e) => e.replace(".", ""))
				.includes(ext)
		)?.[0] as FormatKey;
	};

	return { formats, formatOrder, getFormatByExtension };
};
