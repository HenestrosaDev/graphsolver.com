import { describe, it, expect } from "vitest";
import { useGraphFormats } from "../useGraphFormats";

describe("useGraphFormats", () => {
	it("should include CSV format", () => {
		const { formats, formatOrder } = useGraphFormats();
		expect(formatOrder).toContain("CSV");
		expect(formats.CSV).toBeDefined();
		expect(formats.CSV.ext).toBe("csv");
		expect(formats.CSV.mime).toBe("text/csv");
	});

	it("should include GML format", () => {
		const { formats, formatOrder } = useGraphFormats();
		expect(formatOrder).toContain("GML");
		expect(formats.GML).toBeDefined();
		expect(formats.GML.ext).toBe("gml");
		expect(formats.GML.mime).toBe("text/plain");
	});
});