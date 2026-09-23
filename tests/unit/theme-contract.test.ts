import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("ThemeProvider storage contract", () => {
	it("persists under the cookie-policy theme key and follows the OS by default", () => {
		const source = read("src/components/providers/ThemeProvider.tsx");
		expect(source).toContain('storageKey="theme"');
		expect(source).toContain('defaultTheme="system"');
		expect(source).toContain('attribute="class"');
		expect(source).toContain("enableSystem");
	});
});

describe("ThemeToggle reduced motion", () => {
	it("skips view transitions when the OS asks for reduced motion", () => {
		const source = read("src/components/ui/ThemeToggle.tsx");
		expect(source).toContain('"(prefers-reduced-motion: reduce)"');
		expect(source).toContain("document.startViewTransition");
		expect(source).toMatch(/setTheme\(newTheme\);\s*return;/);
	});
});
