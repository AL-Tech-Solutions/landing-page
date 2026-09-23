import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("hero LCP portrait", () => {
	it("eager-loads a sized WebP with fetchPriority high", () => {
		const hero = read("src/components/hero/HeroSection.tsx");

		expect(hero).toContain("profile.profileImage");
		expect(hero).toContain('loading="eager"');
		expect(hero).toContain('fetchPriority="high"');
		expect(hero).toContain("width={160}");
		expect(hero).toContain("height={160}");
		expect(hero).toMatch(/alt=.*Andrii Lytvynenko/);
		expect(profile.profileImage).toMatch(/\.webp$/);
	});
});

describe("above-fold copy stays data-driven", () => {
	it("renders profile claim fields in the home hero", () => {
		const hero = read("src/components/hero/HeroSection.tsx");

		for (const field of [
			"profile.headline",
			"profile.subtitle",
			"profile.availability",
			"profile.ctaPrimary",
			"profile.ctaSecondary",
			"profile.trustLine",
			"profile.resumeUrl",
		]) {
			expect(hero).toContain(field);
		}
	});

	it("renders hire claim fields in the hire hero", () => {
		const hero = read("src/components/hire/HireHero.tsx");

		for (const field of [
			"hire.headline",
			"hire.offer",
			"hire.availability",
			"hire.ctaPrimary",
			"hire.ctaPrimaryHref",
			"hire.ctaSecondary",
			"hire.ctaSecondaryHref",
			"hire.trustLine",
		]) {
			expect(hero).toContain(field);
		}
	});

	it("maps every highlight and trust badge to a known icon", () => {
		const card = read("src/components/bento/HighlightsCard.tsx");
		expect(card).toContain("profile.highlights.map");
		expect(card).toContain("profile.trustBadges.map");

		const highlightIcons = ["briefcase", "award", "chart", "shield"];
		expect(profile.highlights.length).toBeLessThanOrEqual(
			highlightIcons.length,
		);

		for (const badge of profile.trustBadges) {
			expect(["briefcase", "shield", "map-marker"]).toContain(badge.icon);
		}
	});
});
