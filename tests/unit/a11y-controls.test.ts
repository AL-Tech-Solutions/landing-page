import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("skip-link stays keyboard-reachable", () => {
	it("hides off-screen until focus and keeps a reduced-motion fallback", () => {
		const css = read("src/app/globals.css");
		const layout = read("src/app/layout.tsx");

		expect(layout).toContain('className="skip-link"');
		expect(layout).toContain('href="#main-content"');
		expect(css).toMatch(/\.skip-link\s*\{/);
		expect(css).toContain("-top-12");
		expect(css).toMatch(/\.skip-link:focus/);
		expect(css).toMatch(/\.skip-link:focus-visible/);
		expect(css).toContain("top-0");
		expect(css).toContain("@media (prefers-reduced-motion: reduce)");
	});
});

describe("cookie choice controls", () => {
	it("keeps Accept and Reject as labelled 44px buttons that do not load GA themselves", () => {
		const banner = read("src/components/ui/CookieConsentBanner.tsx");

		expect(banner).toContain('aria-label="Accept analytics cookies"');
		expect(banner).toContain('aria-label="Reject analytics cookies"');
		expect(banner).toContain("onClick={onAccept}");
		expect(banner).toContain("onClick={onReject}");
		expect(banner).toContain('type="button"');
		expect(banner).toContain("min-h-[44px] min-w-[44px]");
		expect(banner).toContain('href="/cookie-policy/"');
		expect(banner).toContain('href="/privacy-policy/"');
		expect(banner).not.toMatch(/loadGoogleAnalytics|googletagmanager/);
	});
});

describe("navbar preference toggles stay labelled", () => {
	it("keeps Lite Mode and the hamburger on named 44px controls", () => {
		const lite = read("src/components/ui/LiteModeToggle.tsx");
		expect(lite).toContain("Lite mode on");
		expect(lite).toContain("Lite mode off");
		expect(lite).toContain("min-h-[44px] min-w-[44px]");
		expect(lite).toContain("setReduceEffects(!reduceEffects)");

		const navbar = read("src/components/layout/Navbar.tsx");
		expect(navbar).toContain("aria-expanded={isMenuOpen}");
		expect(navbar).toContain(
			'aria-label={isMenuOpen ? "Close menu" : "Open menu"}',
		);
		expect(navbar).toContain("min-h-[44px] min-w-[44px]");
	});
});
