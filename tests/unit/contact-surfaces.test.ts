import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

const CONTACT_SURFACES = [
	"src/components/bento/ContactCard.tsx",
	"src/components/layout/Footer.tsx",
	"src/components/hire/HireContact.tsx",
];

describe("conversion surfaces keep a single mailto inbox", () => {
	it("uses profile.email on Contact, Footer, and Hire contact — never a hardcoded second inbox", () => {
		expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

		for (const rel of CONTACT_SURFACES) {
			const source = read(rel);
			expect(source, rel).toContain("mailto:${profile.email}");
			expect(source, rel).not.toMatch(/href=["']mailto:/);
			expect(source, rel).not.toMatch(/<form[\s>]/);
			expect(source, rel).not.toMatch(/<input[\s>]/);
			expect(source, rel).not.toMatch(/<textarea[\s>]/);
		}
	});
});

describe("footer Cookie settings stays the withdraw-consent control", () => {
	it("mounts CookieSettingsButton as a 44px button that only reopens consent", () => {
		const footer = read("src/components/layout/Footer.tsx");
		expect(footer).toContain(
			'import { CookieSettingsButton } from "@/components/ui/CookieSettingsButton"',
		);
		expect(footer).toContain("<CookieSettingsButton />");
		expect(footer).not.toMatch(/loadGoogleAnalytics|googletagmanager/);

		const button = read("src/components/ui/CookieSettingsButton.tsx");
		expect(button).toContain('import { reopenConsent } from "@/lib/consent"');
		expect(button).toContain("onClick={reopenConsent}");
		expect(button).toContain('type="button"');
		expect(button).toContain("min-h-[44px]");
		expect(button).toContain("Cookie settings");
		expect(button).not.toMatch(/loadGoogleAnalytics|stopGoogleAnalytics/);
	});
});
