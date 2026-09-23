import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("public marketing routes stay indexable", () => {
	it("keeps home on the custom domain with index, follow, and a same-origin canonical", () => {
		const layout = read("src/app/layout.tsx");
		expect(layout).toContain('const SITE_URL = "https://alytvynenko.net"');
		expect(layout).toContain("metadataBase: new URL(SITE_URL)");
		expect(layout).toMatch(/robots:\s*\{\s*index:\s*true,\s*follow:\s*true/);
		expect(layout).toMatch(/canonical:\s*SITE_URL/);
	});

	it("keeps /hire indexable with a trailing-slash canonical", () => {
		const hire = read("src/app/hire/page.tsx");
		expect(hire).toContain("const HIRE_URL = `${SITE_URL}/hire/`");
		expect(hire).toMatch(/robots:\s*\{\s*index:\s*true,\s*follow:\s*true/);
		expect(hire).toMatch(/canonical:\s*HIRE_URL/);
	});
});

describe("document and legal routes stay noindex", () => {
	it("noindexes privacy, cookie, and resume pages while still allowing follow", () => {
		for (const rel of [
			"src/app/privacy-policy/page.tsx",
			"src/app/cookie-policy/page.tsx",
			"src/app/resume/page.tsx",
		]) {
			expect(read(rel), rel).toMatch(
				/robots:\s*\{\s*index:\s*false,\s*follow:\s*true/,
			);
		}
	});

	it("noindexes allowlisted viewer documents and does not invent metadata for unknown slugs", () => {
		const viewer = read("src/app/viewer/[document]/page.tsx");
		expect(viewer).toMatch(/robots:\s*\{\s*index:\s*false,\s*follow:\s*true/);
		expect(viewer).toContain('return { title: "Not Found" }');
		expect(viewer).toContain("notFound()");
	});
});
