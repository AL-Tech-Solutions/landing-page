import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const SRC = path.join(ROOT, "src");

const CONTROLLER = "Andrii Lytvynenko Tech Solutions";
const NIP = "9492279891";
const REGON = "543171480";

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

describe("GDPR controller identity stays one source of truth", () => {
	it("locks the same NIP, REGON, and controller name on both policy pages", () => {
		expect(NIP).toMatch(/^\d{10}$/);
		expect(REGON).toMatch(/^\d{9}$/);

		for (const rel of [
			"src/app/privacy-policy/page.tsx",
			"src/app/cookie-policy/page.tsx",
		]) {
			const source = read(rel);
			expect(source, rel).toContain(CONTROLLER);
			expect(source, rel).toContain(`NIP: ${NIP}`);
			expect(source, rel).toContain(`REGON: ${REGON}`);
			expect(source, rel).toContain("Częstochowa, Poland");
		}
	});

	it("names the Polish supervisory authority on the privacy policy", () => {
		const privacy = read("src/app/privacy-policy/page.tsx");
		expect(privacy).toContain("UODO");
		expect(privacy).toContain("uodo.gov.pl");
		expect(privacy).toMatch(/Personal Data Protection Office/i);
	});
});

describe("privacy copy matches the live contact surface", () => {
	it("claims there are no contact forms, and src has none", () => {
		expect(read("src/app/privacy-policy/page.tsx")).toMatch(
			/This Website does not have contact forms or user registration/,
		);

		const formTags: string[] = [];
		for (const file of walkTsFiles(SRC)) {
			const source = readFileSync(file, "utf8");
			const hits = source.match(/<form[\s>]/g);
			if (hits) {
				formTags.push(`${path.relative(ROOT, file)} (${hits.length})`);
			}
		}

		expect(formTags).toEqual([]);
	});
});
