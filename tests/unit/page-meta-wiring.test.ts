import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hirePageMeta } from "@/data/hire";
import { homePageMeta } from "@/data/seo";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("route metadata stays wired to the locked data modules", () => {
	it("reads home title and OG from homePageMeta, not a hardcoded hire-flavored string", () => {
		const layout = read("src/app/layout.tsx");

		expect(layout).toContain('import { homePageMeta } from "@/data/seo"');
		expect(layout).toContain("title: homePageMeta.title");
		expect(layout).toContain("description: homePageMeta.description");
		expect(layout).toContain("title: homePageMeta.ogTitle");
		expect(layout).toContain("description: homePageMeta.ogDescription");

		expect(layout).not.toContain(homePageMeta.title);
		expect(layout).not.toContain(homePageMeta.description);
		expect(layout).not.toContain(homePageMeta.ogTitle);
		expect(layout).not.toContain(hirePageMeta.title);
		expect(layout).not.toMatch(/Hire a Senior|Hire Senior DevOps/i);
	});

	it("reads /hire title and OG from hirePageMeta and keeps it off the locked H1", () => {
		const hirePage = read("src/app/hire/page.tsx");

		expect(hirePage).toContain('import { hirePageMeta } from "@/data/hire"');
		expect(hirePage).toContain("title: hirePageMeta.title");
		expect(hirePage).toContain("description: hirePageMeta.description");

		expect(hirePage).not.toContain(hirePageMeta.title);
		expect(hirePage).not.toContain(hirePageMeta.description);
		expect(hirePageMeta.title).not.toBe(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);
	});
});
