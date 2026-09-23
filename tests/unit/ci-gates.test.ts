import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function readWorkflow(name: string) {
	return readFileSync(path.join(ROOT, ".github/workflows", name), "utf8");
}

describe("CI gates", () => {
	const ci = readWorkflow("ci.yml");

	it("runs Prettier and unit tests in the blocking lint job before build", () => {
		const formatAt = ci.indexOf("npm run format:check");
		const testAt = ci.indexOf("npm test");
		const buildAt = ci.indexOf("npm run build");

		expect(formatAt).toBeGreaterThan(-1);
		expect(testAt).toBeGreaterThan(-1);
		expect(buildAt).toBeGreaterThan(testAt);
		expect(testAt).toBeGreaterThan(formatAt);
		expect(ci).toContain("node-version-file: .nvmrc");
	});
});

describe("OSV lockfile gate", () => {
	const osv = readWorkflow("osv-scanner.yml");

	it("fails the job only through the HIGH/CRITICAL Python script", () => {
		expect(osv).toMatch(/contents:\s*read/);
		expect(osv).toContain("continue-on-error: true");
		expect(osv).toContain("--lockfile=./package-lock.json");
		expect(osv).toContain(
			"python3 .github/scripts/osv-fail-on-high-critical.py osv-results.json",
		);
		expect(osv).not.toMatch(/contents:\s*write/);
	});
});

describe("deploy workflow", () => {
	const deploy = readWorkflow("deploy.yml");

	it("deploys only from main and publishes the static export", () => {
		expect(deploy).toContain("branches: [main]");
		expect(deploy).not.toMatch(/pull_request:/);
		expect(deploy).toContain("publish_dir: ./out");
		expect(deploy).toContain("node-version-file: .nvmrc");
		expect(deploy).toContain("npm ci");
	});
});
