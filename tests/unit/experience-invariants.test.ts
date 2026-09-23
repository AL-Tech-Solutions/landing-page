import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";

const BARE_LI = /<li(?:\s[^>]*)?>/gi;

describe("experience current-role flags", () => {
	it("marks Present only when dates say Present, and at most one role is current", () => {
		const current = experiences.filter((exp) => exp.present);
		expect(current).toHaveLength(1);
		expect(current[0].dates).toMatch(/Present/i);

		for (const exp of experiences) {
			expect(exp.dates.includes("Present")).toBe(exp.present);
		}
	});
});

describe("Experience and Education HTML stays ExpandableDescription-parseable", () => {
	it("uses bare <li> items inside a <ul> so the list regex can split proof bullets", () => {
		const blobs = [
			...experiences.map((exp) => exp.description),
			...educations.map((edu) => edu.description),
		];

		expect(blobs.length).toBeGreaterThan(0);
		for (const html of blobs) {
			expect(html).toMatch(/<ul>[\s\S]*<\/ul>/);
			const opens = html.match(/<li>/g) ?? [];
			const closes = html.match(/<\/li>/g) ?? [];
			const attributed = html.match(BARE_LI)?.filter((tag) => tag !== "<li>");
			expect(opens.length).toBeGreaterThan(0);
			expect(opens.length).toBe(closes.length);
			expect(attributed ?? []).toEqual([]);
		}
	});
});
