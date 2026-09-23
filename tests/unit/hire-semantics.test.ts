import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hire } from "@/data/hire";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("Hire FAQ stays a native disclosure widget", () => {
	it("maps each FAQ to details/summary instead of a click-only accordion", () => {
		const source = read("src/components/hire/HireFaq.tsx");
		expect(source).toContain("<details");
		expect(source).toContain("<summary");
		expect(source).toContain("{hire.faqs.map((item) => (");
		expect(source).not.toMatch(/useState/);
		expect(hire.faqs.length).toBeGreaterThan(0);
		expect(new Set(hire.faqs.map((item) => item.id)).size).toBe(
			hire.faqs.length,
		);
	});
});

describe("Hire engage steps stay an ordered list", () => {
	it("renders engage steps as ol/li in source order", () => {
		const source = read("src/components/hire/HireEngage.tsx");
		expect(source).toContain("<ol");
		expect(source).toContain("<li key={step.id}");
		expect(source).toContain("hire.engageSteps.map");
		expect(hire.engageSteps).toHaveLength(3);
		expect(hire.engageSteps.map((step) => step.title)).toEqual([
			"Intake",
			"Delivery",
			"Handoff",
		]);
	});
});
