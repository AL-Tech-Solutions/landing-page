import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function collapsed(rel: string) {
	return read(rel).replace(/\s+/g, " ");
}

describe("policy copy matches the live consent and storage model", () => {
	it("lists the essential localStorage keys the app actually writes", () => {
		const cookiePolicy = read("src/app/cookie-policy/page.tsx");
		const consent = read("src/lib/consent.ts");
		const liteMode = read("src/components/providers/ReduceEffectsProvider.tsx");
		const theme = read("src/components/providers/ThemeProvider.tsx");

		expect(consent).toContain('const CONSENT_KEY = "cookie-consent"');
		expect(liteMode).toContain(
			'const LITE_MODE_STORAGE_KEY = "reduce-effects"',
		);
		expect(theme).toContain('storageKey="theme"');

		expect(cookiePolicy).toContain("cookie-consent");
		expect(cookiePolicy).toContain("reduce-effects");
		expect(cookiePolicy).toContain(">theme<");
		expect(cookiePolicy).toMatch(
			/analytics cookies only after you have given your consent/i,
		);
		expect(collapsed("src/app/cookie-policy/page.tsx")).toContain(
			"You can change your choice anytime via Cookie settings in the footer.",
		);
	});

	it("keeps privacy copy consent-first and names the reopen path", () => {
		const privacy = collapsed("src/app/privacy-policy/page.tsx");
		expect(privacy).toMatch(
			/Analytics scripts are only loaded after you accept analytics cookies/i,
		);
		expect(privacy).toMatch(
			/If you reject, no analytics scripts are loaded and no analytics cookies are set/i,
		);
		expect(read("src/app/privacy-policy/page.tsx")).toContain(
			'href="/cookie-policy"',
		);
	});
});
