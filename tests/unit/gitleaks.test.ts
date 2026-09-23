import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

describe("gitleaks allowlist stays narrowly scoped", () => {
	const toml = readFileSync(path.join(ROOT, ".gitleaks.toml"), "utf8");

	it("extends the default rule set instead of replacing it", () => {
		expect(toml).toMatch(/useDefault\s*=\s*true/);
		expect(toml).not.toMatch(/disabled\s*=\s*true/);
	});

	it("AND-restricts the historical _next Sourcegraph false positive", () => {
		expect(toml).toMatch(/condition\s*=\s*"AND"/);
		expect(toml).not.toMatch(/condition\s*=\s*"OR"/);
		expect(toml).toMatch(/ids\s*=\s*\["sourcegraph-access-token"\]/);
		expect(toml).toMatch(/paths\s*=\s*\['''\(\^\|\/\)_next\//);
	});
});

describe("gitleaks workflow token permissions", () => {
	const yml = readFileSync(
		path.join(ROOT, ".github", "workflows", "gitleaks.yml"),
		"utf8",
	);

	it("pins GITHUB_TOKEN to contents read and PR write", () => {
		expect(yml).toMatch(/^permissions:\n\t? {2}contents: read$/m);
		expect(yml).toMatch(/pull-requests:\s*write/);
		expect(yml).not.toMatch(/contents:\s*write/);
		expect(yml).not.toMatch(/permissions:\s*write-all/);
		expect(yml).toContain("GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}");
	});
});
