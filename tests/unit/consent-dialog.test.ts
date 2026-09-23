import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const BANNER = "src/components/ui/CookieConsentBanner.tsx";
const FOOTER = "src/components/layout/Footer.tsx";

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("cookie banner stays a focusable dialog", () => {
	it("exposes a labelled dialog and hides it after a choice", () => {
		const banner = read(BANNER);

		expect(banner).toContain('role="dialog"');
		expect(banner).toContain('aria-labelledby="cookie-settings-title"');
		expect(banner).toContain('aria-describedby="cookie-consent-description"');
		expect(banner).toContain("tabIndex={-1}");
		expect(banner).toContain("if (consent !== null)");
		expect(banner).toContain("return null");
		expect(banner).toContain(
			"bannerRef.current.focus({ preventScroll: true })",
		);
	});

	it("keeps Cookie settings in the footer so the same dialog can reopen", () => {
		const footer = read(FOOTER);
		expect(footer).toContain("CookieSettingsButton");
		expect(footer).not.toMatch(/loadGoogleAnalytics|googletagmanager/);
	});
});
