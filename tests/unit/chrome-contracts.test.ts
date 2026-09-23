import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("404 page stays a reachable document", () => {
	it("keeps the skip-link target, a home exit, and chrome", () => {
		const notFound = read("src/app/not-found.tsx");
		expect(notFound).toContain('id="main-content"');
		expect(notFound).toContain('href="/"');
		expect(notFound).toContain("404");
		expect(notFound).toContain("Go Home");
		expect(notFound).toContain("Navbar");
		expect(notFound).toContain("Footer");
	});
});

describe("brand accent stays one token", () => {
	it("keeps the layout theme-color on the CSS accent token", () => {
		const layout = read("src/app/layout.tsx");
		const css = read("src/app/globals.css");

		expect(layout).toMatch(/themeColor:\s*"#3366CC"/);
		expect(css).toMatch(/--color-accent:\s*#3366cc/i);
		expect(css).toMatch(/--color-accent-dark:\s*#204090/i);
		expect(css).toMatch(/--color-accent-light:\s*#66ccff/i);
	});
});

describe("hydration-sensitive chrome", () => {
	it("treats the client as mounted and SSR as not mounted", () => {
		const hooks = read("src/lib/hooks.ts");
		expect(hooks).toContain("useSyncExternalStore");
		expect(hooks).toMatch(
			/emptySubscribe,\s*\(\)\s*=>\s*true,\s*\(\)\s*=>\s*false/,
		);
	});

	it("closes the mobile menu when the path changes", () => {
		const navbar = read("src/components/layout/Navbar.tsx");
		expect(navbar).toContain("if (prevPathname !== pathname)");
		expect(navbar).toContain("setIsMenuOpen(false)");
		expect(navbar).toContain('aria-controls="mobile-menu"');
	});
});
