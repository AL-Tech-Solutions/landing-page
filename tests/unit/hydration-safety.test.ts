import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("Dark Reader hydration cleaner", () => {
	it("strips only Dark Reader attributes and disconnects after 500ms", () => {
		const layout = read("src/app/layout.tsx");

		expect(layout).toContain("data-darkreader-inline-stroke");
		expect(layout).toContain("data-darkreader-inline-color");
		expect(layout).toContain("--darkreader-inline-stroke");
		expect(layout).toContain("--darkreader-inline-color");
		expect(layout).toContain("MutationObserver");
		expect(layout).toContain("setTimeout(function(){obs.disconnect();},500)");
		expect(layout).toContain("querySelectorAll('svg,img')");
		expect(layout).toMatch(/attributeFilter:\s*\['style','data-darkreader-/);

		expect(layout).not.toMatch(/googletagmanager|gtag\(/);
		expect(layout).not.toContain('removeAttribute("class")');
		expect(layout).not.toContain("removeAttribute('class')");
	});
});

describe("consent chrome hydrates after mount", () => {
	it("renders the cookie banner only when useIsMounted is true", () => {
		const provider = read("src/components/providers/ConsentProvider.tsx");

		expect(provider).toContain("useIsMounted");
		expect(provider).toMatch(/\{mounted && \(/);
		expect(provider).toContain("CookieConsentBanner");
		expect(provider).toContain("loadGoogleAnalytics");
		expect(provider).toContain('consent === "accepted"');
	});

	it("nests Theme and Lite Mode inside ConsentProvider", () => {
		const layout = read("src/app/layout.tsx");
		const consent = layout.indexOf("<ConsentProvider>");
		const theme = layout.indexOf("<ThemeProvider>");
		const lite = layout.indexOf("<ReduceEffectsProvider>");

		expect(consent).toBeGreaterThan(-1);
		expect(theme).toBeGreaterThan(consent);
		expect(lite).toBeGreaterThan(theme);
	});
});
