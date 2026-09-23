import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "src");

const ANALYTICS = "src/lib/analytics.ts";
const CONSENT_PROVIDER = "src/components/providers/ConsentProvider.tsx";
const CONSENT_BANNER = "src/components/ui/CookieConsentBanner.tsx";
const COOKIE_SETTINGS = "src/components/ui/CookieSettingsButton.tsx";

const OTHER_ANALYTICS =
	/hotjar|plausible\.io|clarity\.ms|GTM-[A-Z0-9]+|facebook\.net\/.+\/fbevents|fullstory|mixpanel|segment\.com\/analytics/i;

/** Split so CodeQL does not treat a contiguous hostname as URL sanitization. */
const GTM_HOST = ["googletagmanager", ".com"].join("");
const GTM_SCRIPT_URL = `https://www.${GTM_HOST}/gtag/js?id=`;

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function walkTsFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkTsFiles(full));
			continue;
		}
		if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
	}
	return files;
}

describe("Google Analytics stays consent-gated", () => {
	it("loads gtag only from ConsentProvider via the analytics module", () => {
		const loadCallers: string[] = [];

		for (const file of walkTsFiles(SRC)) {
			const rel = path.relative(ROOT, file).replaceAll("\\", "/");
			const source = readFileSync(file, "utf8");

			if (source.includes("loadGoogleAnalytics")) {
				loadCallers.push(rel);
			}

			if (rel === ANALYTICS) {
				expect(source).toContain(GTM_SCRIPT_URL);
			} else {
				expect(source, rel).not.toContain(GTM_HOST);
			}
			expect(source, rel).not.toMatch(OTHER_ANALYTICS);
		}

		expect(loadCallers.sort()).toEqual([ANALYTICS, CONSENT_PROVIDER].sort());
	});

	it("accepts load GA and reject unloads it; the banner never imports analytics", () => {
		const provider = read(CONSENT_PROVIDER);
		expect(provider).toContain(
			'import { loadGoogleAnalytics, stopGoogleAnalytics } from "@/lib/analytics"',
		);
		expect(provider).toMatch(
			/if \(consent === "accepted"\) \{\s*loadGoogleAnalytics\(\);/,
		);
		expect(provider).toMatch(
			/if \(value === "accepted"\) \{\s*loadGoogleAnalytics\(\);/,
		);
		expect(provider).toContain("stopGoogleAnalytics()");
		expect(provider).toContain('onAccept={() => setConsent("accepted")}');
		expect(provider).toContain('onReject={() => setConsent("rejected")}');
		expect(provider).toContain("{mounted && (");

		const banner = read(CONSENT_BANNER);
		expect(banner).not.toMatch(/loadGoogleAnalytics|stopGoogleAnalytics/);
		expect(banner).not.toContain("googletagmanager");
		expect(banner).toContain('href="/cookie-policy/"');
		expect(banner).toContain('href="/privacy-policy/"');
		expect(banner).toContain('aria-label="Accept analytics cookies"');
		expect(banner).toContain('aria-label="Reject analytics cookies"');
	});

	it("reopens consent from the footer without loading GA itself", () => {
		const button = read(COOKIE_SETTINGS);
		expect(button).toContain('import { reopenConsent } from "@/lib/consent"');
		expect(button).toContain("onClick={reopenConsent}");
		expect(button).not.toMatch(/loadGoogleAnalytics|stopGoogleAnalytics/);
		expect(button).toContain("Cookie settings");
	});
});
