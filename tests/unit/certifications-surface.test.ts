import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { certificates } from "@/data/certificates";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("CertificationsCard earned vs planned rendering", () => {
	it("treats a non-empty Credly link as earned and never offers Verify on planned cards", () => {
		const card = read("src/components/bento/CertificationsCard.tsx");

		expect(card).toContain("certificates.map((cert) =>");
		expect(card).toContain('const isEarned = cert.link && cert.link !== ""');
		expect(card).toContain(
			"const isPlanned = cert.planned_year && cert.planned_year.length !== 0",
		);
		expect(card).toContain('{isEarned ? "Earned" : "Planned"}');
		expect(card).toContain("href={cert.link}");
		expect(card).toContain("Verify");
		expect(card).toContain("Target: {cert.planned_year}");
		expect(card).toContain("alt={cert.title}");
		expect(card).toContain('loading="lazy"');
		expect(card).toContain("width={80}");
		expect(card).toContain("height={80}");
		expect(card).toContain(
			"skipAnimations = reduceEffects || prefersReducedMotion",
		);

		const earnedBranch = card.slice(
			card.indexOf("{isEarned ? ("),
			card.indexOf(") : ("),
		);
		const plannedBranch = card.slice(card.indexOf(") : ("));

		expect(earnedBranch).toContain("Verify");
		expect(earnedBranch).toContain("href={cert.link}");
		expect(earnedBranch).toContain('target="_blank"');
		expect(earnedBranch).toContain('rel="noopener noreferrer"');
		expect(plannedBranch).toContain("Target: {cert.planned_year}");
		expect(plannedBranch).not.toContain("Verify");
		expect(plannedBranch).not.toContain("href={cert.link}");
	});

	it("ships both earned and planned certificates so the card branches stay live", () => {
		expect(certificates.some((cert) => Boolean(cert.link))).toBe(true);
		expect(
			certificates.some((cert) => !cert.link && Boolean(cert.planned_year)),
		).toBe(true);
	});
});
