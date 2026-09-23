import { describe, expect, it } from "vitest";
import {
	getDisciplineChipDisplayLabel,
	parseDisciplineListItems,
} from "@/lib/discipline-segments";

describe("parseDisciplineListItems", () => {
	it("expands AWS parenthetical services and keeps sibling skills", () => {
		expect(
			parseDisciplineListItems(["AWS (EC2, ECS, S3), Terraform, Grafana"]),
		).toEqual(["EC2", "ECS", "S3", "Terraform", "Grafana"]);
	});

	it("strips a redundant AWS prefix from standalone items", () => {
		expect(
			parseDisciplineListItems(["AWS Lambda, AWS Cost Explorer, AWS"]),
		).toEqual(["Lambda", "Cost Explorer", "AWS"]);
	});

	it("keeps a lone AWS token so the chip can be icon-only", () => {
		expect(parseDisciplineListItems(["AWS"])).toEqual(["AWS"]);
	});

	it("flattens multiple raw strings", () => {
		expect(
			parseDisciplineListItems(["Terraform, Docker", "AWS (EKS, S3)"]),
		).toEqual(["Terraform", "Docker", "EKS", "S3"]);
	});

	it("expands AWS parentheticals without a space before the paren", () => {
		expect(parseDisciplineListItems(["AWS(EC2, S3)"])).toEqual(["EC2", "S3"]);
	});

	it("expands AWS groups case-insensitively and keeps inner service casing", () => {
		expect(parseDisciplineListItems(["aws (EC2, S3)"])).toEqual(["EC2", "S3"]);
	});

	it("expands nested parentheses inside an AWS group", () => {
		expect(
			parseDisciplineListItems(["AWS (Foo (bar, baz), Qux), Terraform"]),
		).toEqual(["Foo (bar, baz)", "Qux", "Terraform"]);
	});

	it("does not expand an unbalanced AWS parenthesis group", () => {
		expect(parseDisciplineListItems(["AWS (EC2, S3"])).toEqual(["(EC2, S3"]);
	});

	it("keeps empty AWS () as a non-expanded segment, then strips the prefix", () => {
		expect(parseDisciplineListItems(["AWS ()"])).toEqual(["()"]);
	});

	it("drops blank entries after trim", () => {
		expect(parseDisciplineListItems(["", "  ", "Docker"])).toEqual(["Docker"]);
	});
});

describe("getDisciplineChipDisplayLabel", () => {
	it("hides visible text for a lone AWS token (any case)", () => {
		expect(getDisciplineChipDisplayLabel("AWS")).toBe("");
		expect(getDisciplineChipDisplayLabel("aws")).toBe("");
		expect(getDisciplineChipDisplayLabel("  AWS  ")).toBe("");
	});

	it("returns the trimmed label for every other skill", () => {
		expect(getDisciplineChipDisplayLabel("  EC2  ")).toBe("EC2");
		expect(getDisciplineChipDisplayLabel("AWS Lambda")).toBe("AWS Lambda");
	});
});
