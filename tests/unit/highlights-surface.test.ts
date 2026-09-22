import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("HighlightsCard stays data-driven", () => {
	it("renders highlight numbers and labels from profile, not hardcoded claims", () => {
		const card = read("src/components/bento/HighlightsCard.tsx");

		expect(card).toContain("profile.highlights.map((highlight, index) =>");
		expect(card).toContain("{highlight.number}");
		expect(card).toContain("{highlight.label}");
		expect(card).not.toContain("5+");
		expect(card).not.toContain("50%");
		expect(card).not.toContain("70%");
		expect(card).not.toMatch(/Years of Experience/);
		expect(card).not.toMatch(/Cost reduction/);
		expect(card).not.toMatch(/Fewer incidents/);

		expect(profile.highlights.map((item) => item.number)).toEqual([
			"5+",
			"5+",
			"Up to 50%",
			"~70%",
		]);
		expect(profile.highlights.map((item) => item.label)).toEqual([
			"Years of Experience",
			"Certifications",
			"Cost reduction (Luxoft engagements)",
			"Fewer incidents (Mercedes-Benz / Luxoft)",
		]);
	});

	it("renders Trust & Compliance badges from profile.trustBadges", () => {
		const card = read("src/components/bento/HighlightsCard.tsx");

		expect(card).toContain("Trust & Compliance");
		expect(card).toContain("profile.trustBadges.map((badge) =>");
		expect(card).toContain("{badge.title}");
		expect(card).not.toMatch(/>B2B</);
		expect(card).not.toMatch(/>GDPR</);
		expect(card).not.toMatch(/>Poland \(EU\)</);

		expect(profile.trustBadges.map((badge) => badge.title)).toEqual([
			"B2B",
			"GDPR",
			"Poland (EU)",
		]);
	});
});
