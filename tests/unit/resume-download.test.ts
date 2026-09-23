import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";

const ROOT = path.resolve(__dirname, "../..");
const LOCKED_DOWNLOAD_NAME = "Andrii_Lytvynenko_Resume.pdf";

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function downloadNames(source: string): string[] {
	const attrs = [...source.matchAll(/download(?:Name)?=["']([^"']+)["']/g)].map(
		(match) => match[1],
	);
	const props = [...source.matchAll(/downloadName:\s*["']([^"']+)["']/g)].map(
		(match) => match[1],
	);
	return [...attrs, ...props];
}

describe("resume download filename stays a single safe basename", () => {
	it("locks hero, /resume, and viewer download names to the same file", () => {
		expect(profile.resumeUrl).toBe("/pdf/resume.pdf");

		const surfaces = [
			"src/components/hero/HeroSection.tsx",
			"src/app/resume/page.tsx",
			"src/app/viewer/[document]/page.tsx",
		];

		const names = surfaces.flatMap((rel) => downloadNames(read(rel)));
		expect(names.length).toBeGreaterThanOrEqual(3);

		for (const name of names.filter((value) => /resume/i.test(value))) {
			expect(name).toBe(LOCKED_DOWNLOAD_NAME);
			expect(name).not.toMatch(/[\\/]/);
			expect(name).not.toContain("..");
		}
	});
});
