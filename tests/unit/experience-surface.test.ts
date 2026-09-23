import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { experiences } from "@/data/experiences";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("ExperienceCard current-role and empty-link rendering", () => {
	it("shows Current and the accent treatment only when present is true", () => {
		const card = read("src/components/bento/ExperienceCard.tsx");

		expect(card).toContain("{exp.present && (");
		expect(card).toContain("Current");
		expect(card).toMatch(
			/exp\.present\s*\?\s*"border-accent\/30 bg-accent\/5"\s*:\s*"border-border bg-surface"/,
		);

		const current = experiences.filter((exp) => exp.present);
		expect(current).toHaveLength(1);
		expect(current[0].company).toBe("Geniusee Inc.");
		expect(current[0].dates).toMatch(/Present/i);
		expect(experiences.some((exp) => !exp.present)).toBe(true);
	});

	it("does not turn empty company or client URLs into links", () => {
		const card = read("src/components/bento/ExperienceCard.tsx");

		expect(card).toContain("{exp.company_link ? (");
		expect(card).toContain("{exp.client_link ? (");
		expect(card).toContain("href={exp.company_link}");
		expect(card).toContain("href={exp.client_link}");
		expect(card).toContain('target="_blank"');
		expect(card).toContain('rel="noopener noreferrer"');

		expect(experiences.some((exp) => exp.company_link && exp.client_link)).toBe(
			true,
		);
		expect(experiences.some((exp) => !exp.company_link)).toBe(true);
		expect(experiences.some((exp) => !exp.client_link)).toBe(true);

		const geniusee = experiences.find((exp) => exp.company === "Geniusee Inc.");
		expect(geniusee?.company_link).toMatch(/^https:\/\//);
		expect(geniusee?.client_link).toBe("");
	});
});
