import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";

const ROOT = path.resolve(__dirname, "../..");

const DIPLOMA_SRC = "/pdf/diploma.pdf";
const SUPPLEMENT_SRC = "/pdf/diploma-supplement.pdf";

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("Education diploma links stay on the in-app viewer", () => {
	it("keeps KhAI PDF paths identical to EducationCard's viewer allowlist", () => {
		const khai = educations.find(
			(edu) => edu.university_title === "Kharkiv Aviation Institute",
		);
		expect(khai).toBeDefined();
		expect(khai?.diploma_pdf).toBe(DIPLOMA_SRC);
		expect(khai?.diploma_supplement_pdf).toBe(SUPPLEMENT_SRC);

		const card = read("src/components/bento/EducationCard.tsx");
		expect(card).toContain(`const DIPLOMA_VIEWER_PATH = "${DIPLOMA_SRC}"`);
		expect(card).toContain(
			`const DIPLOMA_SUPPLEMENT_VIEWER_PATH = "${SUPPLEMENT_SRC}"`,
		);
		expect(card).toContain('href="/viewer/diploma"');
		expect(card).toContain('href="/viewer/diploma-supplement"');
	});
});
