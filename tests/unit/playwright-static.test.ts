import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const source = readFileSync(path.join(ROOT, "playwright.config.ts"), "utf8");

describe("Playwright targets the static export", () => {
	it("serves ./out on 4173 unless PLAYWRIGHT_BASE_URL overrides it", () => {
		expect(source).toContain("npx serve out");
		expect(source).toContain("-l ${PORT}");
		expect(source).toContain("const PORT = 4173");
		expect(source).toContain('testDir: "./tests/e2e"');
		expect(source).toContain("command: `npx serve out -l ${PORT}");
		expect(source).not.toMatch(/command:.*next\s+dev/);
	});

	it("covers desktop and mobile Chromium", () => {
		expect(source).toContain('name: "chromium-desktop"');
		expect(source).toContain('name: "chromium-mobile"');
		expect(source).toContain('devices["Desktop Chrome"]');
		expect(source).toContain('devices["Pixel 7"]');
	});
});
