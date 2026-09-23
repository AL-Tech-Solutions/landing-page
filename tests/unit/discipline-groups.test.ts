import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";
import { getIconForDiscipline, SKILL_CATEGORIES } from "@/data/skillIcons";
import {
	groupDisciplinesForDisplay,
	slugifyAccordionTitle,
} from "@/lib/discipline-groups";

describe("slugifyAccordionTitle", () => {
	it("strips punctuation so Experience and Education titles stay valid ids", () => {
		expect(slugifyAccordionTitle("Technologies & Skills")).toBe(
			"technologies-skills",
		);
		expect(slugifyAccordionTitle("Courses & Disciplines")).toBe(
			"courses-disciplines",
		);
		expect(slugifyAccordionTitle("Technologies & Skills")).not.toContain("&");
	});

	it("collapses separators and trims leading or trailing dashes", () => {
		expect(slugifyAccordionTitle("  Hello---World  ")).toBe("hello-world");
		expect(slugifyAccordionTitle("--Foo--")).toBe("foo");
		expect(slugifyAccordionTitle("")).toBe("");
	});
});

describe("groupDisciplinesForDisplay", () => {
	it("expands AWS parentheticals then groups by category", () => {
		const result = groupDisciplinesForDisplay([
			"AWS (EC2, ECS, S3), Terraform, Grafana",
		]);

		expect(result.parsedItems).toEqual([
			"EC2",
			"ECS",
			"S3",
			"Terraform",
			"Grafana",
		]);
		expect(result.groupedByCategory.cloud).toEqual(["EC2", "ECS", "S3"]);
		expect(result.groupedByCategory.iac).toEqual(["Terraform"]);
		expect(result.groupedByCategory.monitoring).toEqual(["Grafana"]);
		expect(result.orderedCategoryIds).toEqual(["cloud", "iac", "monitoring"]);
	});

	it("dedupes aliases within a category onto the canonical chip", () => {
		const result = groupDisciplinesForDisplay([
			"HashiCorp Terraform, Terraform, Amazon S3, S3",
		]);

		expect(result.groupedByCategory.iac).toEqual(["Terraform"]);
		expect(result.groupedByCategory.cloud).toEqual(["S3"]);
		expect(result.groupedByCategory.iac).toHaveLength(1);
		expect(result.groupedByCategory.cloud).toHaveLength(1);
	});

	it("keeps a lone AWS token so the chip can stay icon-only", () => {
		const result = groupDisciplinesForDisplay(["AWS"]);
		expect(result.parsedItems).toEqual(["AWS"]);
		expect(result.groupedByCategory.cloud).toEqual(["AWS"]);
	});

	it("returns empty groups for blank input", () => {
		const result = groupDisciplinesForDisplay(["", "  "]);
		expect(result.parsedItems).toEqual([]);
		expect(result.groupedByCategory).toEqual({});
		expect(result.orderedCategoryIds).toEqual([]);
	});

	it("keeps other last even when it appears before mapped skills", () => {
		const result = groupDisciplinesForDisplay(["FinOps, Terraform, Docker"]);
		expect(result.groupedByCategory.other).toEqual(["FinOps"]);
		expect(result.orderedCategoryIds.at(-1)).toBe("other");
		expect(result.orderedCategoryIds).toEqual(["iac", "containers", "other"]);
		expect(result.orderedCategoryIds.indexOf("other")).toBe(
			result.orderedCategoryIds.length - 1,
		);
	});

	it("follows SKILL_CATEGORIES order for non-other groups", () => {
		const result = groupDisciplinesForDisplay([
			"Python, Kubernetes, AWS, Jenkins",
		]);
		const expectedOrder = SKILL_CATEGORIES.map((c) => c.id).filter((id) =>
			result.orderedCategoryIds.includes(id),
		);
		expect(result.orderedCategoryIds).toEqual(expectedOrder);
	});
});

describe("Experience and Education chips stay grouped without silent icon loss", () => {
	it("dedupes each Experience row and keeps icons on categorized chips", () => {
		expect(experiences.length).toBeGreaterThan(0);

		for (const exp of experiences) {
			const { parsedItems, groupedByCategory, orderedCategoryIds } =
				groupDisciplinesForDisplay([exp.disciplines]);

			expect(parsedItems.length, exp.company).toBeGreaterThan(0);
			expect(orderedCategoryIds.length, exp.company).toBeGreaterThan(0);

			if (orderedCategoryIds.includes("other")) {
				expect(orderedCategoryIds.at(-1)).toBe("other");
			}

			for (const catId of orderedCategoryIds) {
				const chips = groupedByCategory[catId] ?? [];
				const unique = new Set(chips);
				expect(unique.size, `${exp.company} ${catId}`).toBe(chips.length);

				if (catId === "other") continue;
				for (const chip of chips) {
					if (chip === "Version Control") continue;
					expect(
						getIconForDiscipline(chip),
						`${exp.company} → ${catId} → ${chip} needs an icon`,
					).toEqual(
						expect.objectContaining({
							path: expect.any(String),
						}),
					);
				}
			}
		}
	});

	it("keeps the Academic lab on GCP/GKE and not a client AWS row", () => {
		const lab = educations.find(
			(edu) => edu.university_title === "devops-skill-demonstration",
		);
		expect(lab).toBeDefined();

		const { groupedByCategory, orderedCategoryIds } =
			groupDisciplinesForDisplay([lab!.disciplines]);

		expect(groupedByCategory.cloud).toEqual(expect.arrayContaining(["GCP"]));
		expect(groupedByCategory.containers).toEqual(
			expect.arrayContaining(["GKE", "Kubernetes", "Docker"]),
		);
		expect(groupedByCategory.iac).toEqual(["Terraform"]);
		expect(JSON.stringify(groupedByCategory)).not.toMatch(/"AWS"/);
		expect(orderedCategoryIds.includes("other")).toBe(false);
	});
});
