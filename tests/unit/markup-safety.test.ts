import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "src");

const DANGEROUS_HTML =
	/<script\b|javascript:|vbscript:|data:text\/html|<\s*(iframe|object|embed|form)\b|\son\w+\s*=/i;

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function walkTsFiles(dir: string): string[] {
	const files: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...walkTsFiles(full));
			continue;
		}
		if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
	}
	return files;
}

function tagsWithTargetBlank(source: string): string[] {
	const tags: string[] = [];
	let cursor = 0;
	while (true) {
		const hit = source.indexOf('target="_blank"', cursor);
		if (hit < 0) break;
		const start = source.lastIndexOf("<", hit);
		const end = source.indexOf(">", hit);
		expect(start).toBeGreaterThanOrEqual(0);
		expect(end).toBeGreaterThan(hit);
		tags.push(source.slice(start, end + 1));
		cursor = hit + 'target="_blank"'.length;
	}
	return tags;
}

describe("external links cannot be tabnabbed", () => {
	it("puts noopener noreferrer on every target=_blank in src", () => {
		const files = walkTsFiles(SRC);
		expect(files.length).toBeGreaterThan(0);

		let blankTargets = 0;
		for (const file of files) {
			const tags = tagsWithTargetBlank(readFileSync(file, "utf8"));
			blankTargets += tags.length;
			for (const tag of tags) {
				expect(tag, file).toMatch(/\brel=/);
				expect(tag, file).toMatch(/\bnoopener\b/);
				expect(tag, file).toMatch(/\bnoreferrer\b/);
			}
		}

		expect(blankTargets).toBeGreaterThan(0);
	});
});

describe("HTML rendered via dangerouslySetInnerHTML stays inert", () => {
	it("keeps Experience and Education descriptions free of scripted markup", () => {
		const blobs = [
			...experiences.map((exp) => exp.description),
			...educations.map((edu) => edu.description),
		];

		expect(blobs.length).toBeGreaterThan(0);
		for (const html of blobs) {
			expect(html).not.toMatch(DANGEROUS_HTML);
		}
	});
});

describe("logo fetch sources stay on Wikimedia Commons", () => {
	it("only downloads https Commons URLs into public/images", () => {
		const source = read("tools/fetch-official-logos.mjs");
		const urls = [...source.matchAll(/"(https:\/\/[^"]+)"/g)].map(
			(match) => match[1],
		);

		expect(urls.length).toBeGreaterThan(0);
		for (const url of urls) {
			expect(url).toMatch(
				/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//,
			);
			expect(url).not.toMatch(/\.\./);
		}

		expect(source).toContain('join(PROJECT_ROOT, "public", "images", folder)');
	});
});

describe("mobile nav keeps the required ARIA wiring", () => {
	it("exposes aria-expanded, aria-controls, and a matching menu id", () => {
		const navbar = read("src/components/layout/Navbar.tsx");
		expect(navbar).toContain("aria-expanded={isMenuOpen}");
		expect(navbar).toContain('aria-controls="mobile-menu"');
		expect(navbar).toContain('id="mobile-menu"');
		expect(navbar).toMatch(
			/aria-label=\{isMenuOpen \? "Close menu" : "Open menu"\}/,
		);
	});
});
