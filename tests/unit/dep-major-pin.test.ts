import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("dependency majors stay manual", () => {
	it("tells Dependabot to ignore semver-major for npm and Actions", () => {
		const dependabot = read(".github/dependabot.yml");
		const ignores = [
			...dependabot.matchAll(
				/dependency-name:\s*"\*"\s*\n\s*update-types:\s*\[version-update:semver-major\]/g,
			),
		];
		expect(ignores.length).toBe(2);
		expect(dependabot).toContain("package-ecosystem: npm");
		expect(dependabot).toContain("package-ecosystem: github-actions");
	});

	it("keeps Tailwind on v3 so the PostCSS plugin does not silently jump to v4", () => {
		const pkg = JSON.parse(read("package.json")) as {
			devDependencies: Record<string, string>;
		};
		expect(pkg.devDependencies.tailwindcss).toMatch(/^\^3\./);
	});
});
