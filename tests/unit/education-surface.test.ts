import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DIPLOMA_LAB_ORG_URL, educations } from "@/data/education";

const ROOT = path.resolve(__dirname, "../..");
const DIPLOMA_SRC = "/pdf/diploma.pdf";
const SUPPLEMENT_SRC = "/pdf/diploma-supplement.pdf";

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

const lab = educations.find(
	(edu) => edu.university_link === DIPLOMA_LAB_ORG_URL,
);
const khai = educations.find(
	(edu) => edu.university_title === "Kharkiv Aviation Institute",
);
const epam = educations.find(
	(edu) => edu.university_title === "EPAM University",
);

describe("EducationCard badge and diploma-link gating", () => {
	it("defaults missing badges to Graduated and keeps Academic lab off that label", () => {
		const card = read("src/components/bento/EducationCard.tsx");

		expect(card).toContain('{edu.badge ?? "Graduated"}');
		expect(card).not.toMatch(/\{"Graduated"\}/);
		expect(card).not.toMatch(/>Graduated</);

		expect(lab?.badge).toBe("Academic lab");
		expect(khai?.badge).toBeUndefined();
		expect(epam?.badge).toBeUndefined();
	});

	it("hides View Diploma when diploma paths are empty strings", () => {
		const card = read("src/components/bento/EducationCard.tsx");

		expect(card).toContain(
			"{(edu.diploma_pdf || edu.diploma_supplement_pdf) && (",
		);
		expect(card).toContain("{edu.diploma_pdf &&");
		expect(card).toContain("{edu.diploma_supplement_pdf &&");
		expect(card).toContain("View Diploma");
		expect(card).toContain("View Diploma Supplement");

		expect(lab).toBeDefined();
		expect(epam).toBeDefined();
		expect(lab?.diploma_pdf).toBe("");
		expect(lab?.diploma_supplement_pdf).toBe("");
		expect(epam?.diploma_pdf).toBe("");
		expect(epam?.diploma_supplement_pdf).toBe("");

		expect(lab?.diploma_pdf).not.toBe(DIPLOMA_SRC);
		expect(epam?.diploma_pdf).not.toBe(DIPLOMA_SRC);
		expect(lab?.diploma_supplement_pdf).not.toBe(SUPPLEMENT_SRC);
		expect(epam?.diploma_supplement_pdf).not.toBe(SUPPLEMENT_SRC);

		expect(khai?.diploma_pdf).toBe(DIPLOMA_SRC);
		expect(khai?.diploma_supplement_pdf).toBe(SUPPLEMENT_SRC);
	});
});
