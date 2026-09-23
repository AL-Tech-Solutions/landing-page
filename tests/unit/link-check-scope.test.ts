import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("Lychee still checks public site and credential URLs", () => {
	it("fails CI on broken links and scans src plus the sitemap", () => {
		const ci = read(".github/workflows/ci.yml");
		expect(ci).toContain("--config ./lychee.toml");
		expect(ci).toContain("fail: true");
		expect(ci).toContain("src/");
		expect(ci).toContain("public/sitemap.xml");
		expect(ci).toContain("public/manifest.json");
	});

	it("does not blanket-exclude the live site, Credly, or this GitHub org", () => {
		const lychee = read("lychee.toml");
		expect(lychee).not.toContain("alytvynenko.net");
		expect(lychee).not.toContain("credly.com");
		expect(lychee).not.toContain("github.com/fecton");
		expect(lychee).not.toMatch(/exclude\s*=\s*\[[^\]]*["']\.\*["']/);
	});
});
