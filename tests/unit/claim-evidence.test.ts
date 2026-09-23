import { describe, expect, it } from "vitest";
import { certificates } from "@/data/certificates";
import { experiences } from "@/data/experiences";
import { hire } from "@/data/hire";
import { profile } from "@/data/profile";

const experienceBlob = experiences
	.map((exp) => `${exp.company} ${exp.client} ${exp.description}`)
	.join("\n");

const earnedCertificates = certificates.filter((cert) => Boolean(cert.link));

const RETIRED_HOME_COPY = [
	"GDPR Compliant",
	"View Resume",
	"Cloud Certifications",
	"Hire a Senior",
	"Hire Senior DevOps",
];

describe("home claim pack stays resume-backed", () => {
	it("locks the above-fold headline and CTAs", () => {
		expect(profile.headline).toBe(
			"Cloud infrastructure that costs less and stays up.",
		);
		expect(profile.ctaPrimary).toBe("Let’s talk");
		expect(profile.ctaSecondary).toBe("Download resume");
		expect(profile.resumeUrl).toBe("/pdf/resume.pdf");
		expect(profile.headline).not.toBe(hire.headline);
	});

	it("keeps the 50% cost and ~70% incident claims in Experience proof", () => {
		expect(profile.subtitle).toMatch(/50%/);
		expect(profile.subtitle).toMatch(/70%/);
		expect(profile.bio.experience).toMatch(/50%/);

		const costHighlight = profile.highlights.find((item) =>
			/50%/.test(item.number),
		);
		const incidentHighlight = profile.highlights.find((item) =>
			/70%/.test(item.number),
		);
		expect(costHighlight?.label).toMatch(/Luxoft/i);
		expect(incidentHighlight?.label).toMatch(/Mercedes-Benz/i);

		expect(experienceBlob).toMatch(/50%/);
		expect(experienceBlob).toMatch(/~70%/);
		expect(experienceBlob).toMatch(/Luxoft/i);
		expect(experienceBlob).toMatch(/Mercedes-Benz/i);
	});

	it("backs the 5+ Certifications highlight with earned Credly badges", () => {
		const certHighlight = profile.highlights.find((item) =>
			/certifications/i.test(item.label),
		);
		expect(certHighlight?.number).toBe("5+");
		expect(earnedCertificates.length).toBeGreaterThanOrEqual(5);
		expect(certificates.some((cert) => !cert.link && cert.planned_year)).toBe(
			true,
		);
	});

	it("does not revive retired home copy", () => {
		const blob = JSON.stringify(profile);
		for (const retired of RETIRED_HOME_COPY) {
			expect(blob).not.toContain(retired);
		}
	});
});
