import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { HIRE_CONTACT_DISCLAIMER, hire } from "@/data/hire";
import { profile } from "@/data/profile";
import { person } from "@/lib/json-ld";

const ROOT = path.resolve(__dirname, "../..");
const CANONICAL_HOST = "alytvynenko.net";
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const SITE_URL_FILES = [
	"src/app/layout.tsx",
	"src/app/hire/page.tsx",
	"src/app/resume/page.tsx",
	"src/app/privacy-policy/page.tsx",
	"src/app/cookie-policy/page.tsx",
	"src/app/viewer/[document]/page.tsx",
	"src/lib/json-ld.ts",
];

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function siteUrlIn(source: string, label: string): string {
	const match = source.match(/const SITE_URL = "(https:\/\/[^"]+)"/);
	expect(match?.[1], `${label} must declare SITE_URL`).toMatch(/^https:\/\//);
	return match![1];
}

function mailtoHrefs(source: string): string[] {
	return [...source.matchAll(/href="mailto:([^"]+)"/g)].map(
		(match) => match[1],
	);
}

describe("public origin stays on the custom domain", () => {
	it("locks every SITE_URL and Person url to the CNAME host", () => {
		expect(read("public/CNAME").trim()).toBe(CANONICAL_HOST);

		for (const rel of SITE_URL_FILES) {
			expect(siteUrlIn(read(rel), rel)).toBe(CANONICAL_ORIGIN);
		}

		expect(person.url).toBe(`${CANONICAL_ORIGIN}/`);
		expect(person.image).toBe(`${CANONICAL_ORIGIN}${profile.profileImage}`);
	});
});

describe("contact identity stays one source of truth", () => {
	it("keeps legal mailto addresses on profile.email, never a second inbox", () => {
		expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

		const policyFiles = [
			"src/app/privacy-policy/page.tsx",
			"src/app/cookie-policy/page.tsx",
		];

		for (const rel of policyFiles) {
			const hrefs = mailtoHrefs(read(rel));
			expect(hrefs.length, rel).toBeGreaterThan(0);
			for (const href of hrefs) {
				expect(href, rel).toBe(profile.email);
			}
			expect(read(rel)).toContain(profile.email);
		}

		expect(JSON.stringify(person)).not.toContain(profile.email);
		expect(person).not.toHaveProperty("email");
	});

	it("keeps home and /hire B2B disclaimer, availability, and trust line aligned", () => {
		const homeDisclaimer = `${profile.contactDisclaimerBefore}${profile.contactDisclaimerLink}${profile.contactDisclaimerAfter}`;
		const hireDisclaimer = `${hire.contactDisclaimerBefore}${hire.contactDisclaimerLink}${hire.contactDisclaimerAfter}`;

		expect(homeDisclaimer).toBe(HIRE_CONTACT_DISCLAIMER);
		expect(hireDisclaimer).toBe(HIRE_CONTACT_DISCLAIMER);
		expect(profile.availability).toBe(hire.availability);
		expect(profile.trustLine).toBe(hire.trustLine);
	});
});

describe("social identity stays aligned between UI and JSON-LD", () => {
	const uiSocials = [...profile.socialLinks, ...profile.footerSocialLinks];
	const uiUrls = new Set(uiSocials.map((link) => link.url));
	const urlsByName = new Map<string, string>();

	it("uses the same URL when a network appears in both contact and footer", () => {
		for (const link of uiSocials) {
			const existing = urlsByName.get(link.name);
			if (existing) {
				expect(link.url, link.name).toBe(existing);
			} else {
				urlsByName.set(link.name, link.url);
			}
		}

		expect(urlsByName.get("LinkedIn")).toMatch(/linkedin\.com\/in\//);
		expect(urlsByName.get("GitHub")).toMatch(/^https:\/\/github\.com\//);
	});

	it("puts every public social except WhatsApp in sameAs, and nothing extra", () => {
		const publicUiUrls = [...uiUrls].filter(
			(url) => !url.startsWith("https://wa.me/"),
		);

		expect(person.sameAs.length).toBeGreaterThan(0);
		expect([...person.sameAs].sort()).toEqual([...publicUiUrls].sort());

		for (const url of person.sameAs) {
			expect(url.startsWith("https://")).toBe(true);
			expect(url).not.toMatch(/wa\.me/i);
			expect(url).not.toContain(profile.email);
		}
	});

	it("keeps WhatsApp as digits-only wa.me and off the public schema", () => {
		const whatsapp = profile.socialLinks.find(
			(link) => link.name === "WhatsApp",
		);
		expect(whatsapp?.url).toMatch(/^https:\/\/wa\.me\/\d+$/);
		expect(person.sameAs.join("\n")).not.toMatch(/wa\.me/i);
	});
});
