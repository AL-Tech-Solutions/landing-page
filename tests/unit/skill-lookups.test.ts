import { describe, expect, it } from "vitest";
import {
	getCanonicalForDiscipline,
	getCategoryForDiscipline,
	getIconForDiscipline,
	skillIconMap,
} from "@/data/skillIcons";

describe("getCategoryForDiscipline", () => {
	it("returns the mapped category for an exact skill name", () => {
		expect(getCategoryForDiscipline("Terraform")).toBe("iac");
		expect(getCategoryForDiscipline("Docker")).toBe("containers");
		expect(getCategoryForDiscipline("GKE")).toBe("containers");
		expect(getCategoryForDiscipline("Google Kubernetes Engine")).toBe(
			"containers",
		);
	});

	it("classifies Kafka and AWS streaming/GenAI services as streaming, not containers or cloud", () => {
		expect(getCategoryForDiscipline("Kafka")).toBe("streaming");
		expect(getCategoryForDiscipline("Apache Kafka")).toBe("streaming");
		expect(getCategoryForDiscipline("Amazon Kinesis")).toBe("streaming");
		expect(getCategoryForDiscipline("AWS Bedrock")).toBe("streaming");
		expect(getCategoryForDiscipline("Kinesis")).toBe("streaming");
	});

	it("resolves aliases before category lookup", () => {
		expect(getCategoryForDiscipline("HashiCorp Terraform")).toBe("iac");
		expect(getCategoryForDiscipline("Amazon S3")).toBe("cloud");
	});

	it("classifies AWS-prefixed and known AWS service names as cloud", () => {
		expect(getCategoryForDiscipline("AWS Lambda")).toBe("cloud");
		expect(getCategoryForDiscipline("EC2")).toBe("cloud");
		expect(
			getCategoryForDiscipline(
				"Amazon Elastic Kubernetes Service (Amazon EKS)",
			),
		).toBe("cloud");
	});

	it("returns other for empty or unknown skills", () => {
		expect(getCategoryForDiscipline("")).toBe("other");
		expect(getCategoryForDiscipline("   ")).toBe("other");
		expect(getCategoryForDiscipline("NotARealSkillXYZ")).toBe("other");
	});

	it("uses the first token and AWS(/Amazon prefixes", () => {
		expect(getCategoryForDiscipline("Terraform Modules")).toBe("iac");
		expect(getCategoryForDiscipline("AWS(Lambda)")).toBe("cloud");
		expect(getCategoryForDiscipline("Amazon CloudTrail")).toBe("cloud");
	});
});

describe("getCanonicalForDiscipline", () => {
	it("maps aliases to the canonical chip name used for dedupe", () => {
		expect(getCanonicalForDiscipline("HashiCorp Terraform")).toBe("Terraform");
		expect(getCanonicalForDiscipline("Amazon S3")).toBe("S3");
		expect(getCanonicalForDiscipline("ECS Fargate")).toBe("Fargate");
	});

	it("returns the trimmed original when there is no alias", () => {
		expect(getCanonicalForDiscipline("  Kubernetes  ")).toBe("Kubernetes");
	});

	it("returns an empty string for blank input", () => {
		expect(getCanonicalForDiscipline("")).toBe("");
		expect(getCanonicalForDiscipline("   ")).toBe("");
	});
});

describe("getIconForDiscipline", () => {
	it("returns the exact icon when the name is in the map", () => {
		expect(getIconForDiscipline("Terraform")).toEqual(skillIconMap.Terraform);
	});

	it("uses aliases and known AWS service names", () => {
		expect(getIconForDiscipline("HashiCorp Terraform")).toEqual(
			skillIconMap.Terraform,
		);
		expect(getIconForDiscipline("EC2")).toEqual(skillIconMap.AWS);
		expect(getIconForDiscipline("Amazon S3")).toEqual(skillIconMap.AWS);
		expect(getIconForDiscipline("GKE")).toEqual(skillIconMap.GKE);
		expect(getIconForDiscipline("Google Kubernetes Engine")).toEqual(
			skillIconMap.GKE,
		);
	});

	it("returns null for empty or unknown skills", () => {
		expect(getIconForDiscipline("")).toBeNull();
		expect(getIconForDiscipline("NotARealSkillXYZ")).toBeNull();
	});

	it("uses the first token and AWS( prefix for icons", () => {
		expect(getIconForDiscipline("Terraform Modules")).toEqual(
			skillIconMap.Terraform,
		);
		expect(getIconForDiscipline("AWS(Lambda)")).toEqual(skillIconMap.AWS);
	});
});
