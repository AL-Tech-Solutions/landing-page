import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";
import {
	getCanonicalForDiscipline,
	getCategoryForDiscipline,
	getIconForDiscipline,
} from "@/data/skillIcons";
import { parseDisciplineListItems } from "@/lib/discipline-segments";

const AWS_CLOUD_AFTER_PARSE = [
	"EC2",
	"EKS",
	"S3",
	"Lambda",
	"VPC",
	"RDS",
	"Cost Explorer",
];

describe("discipline parse-then-classify pipeline", () => {
	it("keeps AWS services in cloud and Bedrock/Kinesis in streaming after prefix strip", () => {
		const parsed = parseDisciplineListItems([
			"AWS (EC2, EKS, S3), AWS Bedrock, Amazon Kinesis, Terraform, GKE",
		]);

		expect(parsed).toEqual([
			"EC2",
			"EKS",
			"S3",
			"Bedrock",
			"Amazon Kinesis",
			"Terraform",
			"GKE",
		]);

		expect(getCategoryForDiscipline("EC2")).toBe("cloud");
		expect(getCategoryForDiscipline("EKS")).toBe("cloud");
		expect(getCategoryForDiscipline("S3")).toBe("cloud");
		expect(getCategoryForDiscipline("Bedrock")).toBe("streaming");
		expect(getCategoryForDiscipline("Amazon Kinesis")).toBe("streaming");
		expect(getCategoryForDiscipline("Terraform")).toBe("iac");
		expect(getCategoryForDiscipline("GKE")).toBe("containers");
	});

	it("does not dump parsed AWS services from live Experience rows into other", () => {
		const parsed = experiences.flatMap((exp) =>
			parseDisciplineListItems([exp.disciplines]),
		);
		expect(parsed.length).toBeGreaterThan(20);

		for (const item of parsed) {
			const canonical = getCanonicalForDiscipline(item);
			if (
				AWS_CLOUD_AFTER_PARSE.includes(item) ||
				AWS_CLOUD_AFTER_PARSE.includes(canonical)
			) {
				expect(getCategoryForDiscipline(item), item).toBe("cloud");
				expect(getIconForDiscipline(item), item).not.toBeNull();
			}
			if (/bedrock/i.test(item) || /kinesis/i.test(item)) {
				expect(getCategoryForDiscipline(item), item).toBe("streaming");
			}
		}

		expect(parsed).toContain("Bedrock");
		expect(parsed.some((item) => /kinesis/i.test(item))).toBe(true);
	});

	it("keeps the Academic lab on GCP/GKE after parse, not AWS", () => {
		const lab = educations.find(
			(edu) => edu.university_title === "devops-skill-demonstration",
		);
		expect(lab).toBeDefined();

		const parsed = parseDisciplineListItems([lab!.disciplines]);
		expect(parsed).toContain("GCP");
		expect(parsed).toContain("GKE");
		expect(parsed).not.toContain("AWS");
		expect(parsed.some((item) => /^AWS\b/i.test(item))).toBe(false);

		expect(getCategoryForDiscipline("GCP")).toBe("cloud");
		expect(getCategoryForDiscipline("GKE")).toBe("containers");
	});
});
