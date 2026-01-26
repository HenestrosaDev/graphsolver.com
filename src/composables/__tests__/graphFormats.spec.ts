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
});