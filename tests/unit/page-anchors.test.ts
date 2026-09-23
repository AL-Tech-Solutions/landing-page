import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hire } from "@/data/hire";
import { hireHref, navLinks } from "@/data/nav";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function idsIn(source: string): Set<string> {
	return new Set(
		[...source.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]),
	);
}

function hashTarget(href: string): string | null {
	const index = href.indexOf("#");
	if (index < 0) return null;
	const hash = href.slice(index + 1);
	return hash || null;
}

const PAGE_MAINS = [
	"src/app/page.tsx",
	"src/app/hire/page.tsx",
	"src/app/resume/page.tsx",
	"src/app/privacy-policy/page.tsx",
	"src/app/cookie-policy/page.tsx",
	"src/app/viewer/[document]/page.tsx",
	"src/app/not-found.tsx",
];

describe("primary nav and conversion CTAs resolve to live section ids", () => {
	it("keeps every home-hash nav item on BentoGrid", () => {
		const homeIds = idsIn(read("src/components/bento/BentoGrid.tsx"));
		const hashHrefs = navLinks
			.map((link) => hashTarget(link.href))
			.filter((hash): hash is string => hash !== null);

		expect(hashHrefs).toEqual(["about", "experience", "contact"]);
		for (const hash of hashHrefs) {
			expect(homeIds.has(hash), `BentoGrid is missing id="${hash}"`).toBe(true);
		}

		const resume = navLinks.find((link) => link.label === "Resume");
		expect(resume?.href).toBe("/resume/");
		expect(read("src/app/resume/page.tsx")).toContain(
			"export default function ResumePage",
		);
	});

	it("keeps /hire proof and package CTAs on home experience, certifications, and hire contact", () => {
		const homeIds = idsIn(read("src/components/bento/BentoGrid.tsx"));
		const hireIds = idsIn(read("src/components/hire/HireContact.tsx"));

		expect(homeIds.has("experience")).toBe(true);
		expect(homeIds.has("certifications")).toBe(true);
		expect(hireIds.has("contact")).toBe(true);

		expect(hire.ctaPrimaryHref).toBe("#contact");
		expect(hireHref).toBe("/hire/");

		for (const teaser of hire.proofTeasers) {
			expect(teaser.href).toBe("/#experience");
		}
		for (const badge of hire.badges) {
			expect(badge.href).toBe("/#certifications");
		}
		for (const pkg of hire.packages) {
			expect(pkg.ctaHref).toBe("#contact");
		}
	});

	it("keeps the hero primary CTA on the home contact section", () => {
		const hero = read("src/components/hero/HeroSection.tsx");
		const homeIds = idsIn(read("src/components/bento/BentoGrid.tsx"));

		expect(hero).toMatch(/href=["']#contact["']/);
		expect(homeIds.has("contact")).toBe(true);
	});
});

describe("skip-link and page mains stay aligned", () => {
	it("points the root skip-link at #main-content on every route", () => {
		const layout = read("src/app/layout.tsx");
		expect(layout).toContain('href="#main-content"');
		expect(layout).toContain('className="skip-link"');
		expect(layout).toContain('lang="en"');

		for (const rel of PAGE_MAINS) {
			expect(idsIn(read(rel)).has("main-content"), rel).toBe(true);
		}
	});
});
