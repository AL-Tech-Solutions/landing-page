import { describe, expect, it } from "vitest";
import { HIRE_CONTACT_DISCLAIMER, hire, hirePageMeta } from "@/data/hire";
import { experiences } from "@/data/experiences";
import { profile } from "@/data/profile";
import { certificates } from "@/data/certificates";

const LOCKED_DISCLAIMER =
	"B2B inquiries only. I’ll use your message to reply and talk through a possible engagement (pre-contract). Details in the Privacy Policy. No obligation until we agree scope in writing.";

const FORBIDDEN_SKU = /genai|aiops|bedrock|llm|copilot/i;

const sourceOfTruth = [
	...experiences.map(
		(exp) => `${exp.company} ${exp.client} ${exp.description}`,
	),
	profile.subtitle,
	...profile.highlights.map((h) => `${h.number} ${h.label}`),
].join("\n");

describe("hire conversion copy", () => {
	it("locks the Copywriter hero, CTAs, and contact disclaimer", () => {
		expect(hire.availability).toBe("Available for Q2 2027 Projects");
		expect(profile.availability).toBe("Available for Q2 2027 Projects");
		expect(hire.headline).toBe(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);
		expect(hire.offer).toBe(
			"AWS & Kubernetes · B2B from the EU · Proof on the resume",
		);
		expect(hire.trustLine).toBe("B2B · GDPR · Poland (EU)");
		expect(hire.ctaPrimary).toBe("Let’s talk");
		expect(hire.ctaPrimaryHref).toBe("#contact");
		expect(hire.ctaSecondary).toBe("See full resume");
		expect(hire.ctaSecondaryHref).toBe("/");
		expect(HIRE_CONTACT_DISCLAIMER).toBe(LOCKED_DISCLAIMER);
		expect(
			`${hire.contactDisclaimerBefore}${hire.contactDisclaimerLink}${hire.contactDisclaimerAfter}`,
		).toBe(LOCKED_DISCLAIMER);
		expect(hire.privacyPolicyHref).toBe("/privacy-policy");
		expect(hire.contactCtaLabel).toBe("Let’s talk");
	});

	it("ships three AWS-first packages with the locked Copywriter strings", () => {
		expect(hire.packages).toHaveLength(3);
		expect(hire.packages.map((pkg) => pkg.title)).toEqual([
			"Cloud cost & reliability audit",
			"IaC & Kubernetes platforms",
			"CI/CD & observability",
		]);
		expect(hire.packages.map((pkg) => pkg.bestFor)).toEqual([
			"teams bleeding spend or flying blind on HA/monitoring",
			"Terraform/EKS (or ECS) delivery and migrations",
			"pipeline + golden-signals maturity",
		]);
		expect(hire.packages[0].deliverables).toBe(
			"Cost Explorer + Savings Plans/rightsizing; HA & monitoring gap review; prioritized quick wins with $ or risk impact",
		);
		expect(hire.packages[0].footnote).toBe(
			"Outcomes are case-study style — not guaranteed %.",
		);
		expect(hire.packages[1].deliverables).toBe(
			"Terraform/Terragrunt (TFE migration proof); EKS and/or ECS; HA (multi-AZ, ingress/LB, backup/restore)",
		);
		expect(hire.packages[1].credentials).toBe("Terraform Assoc · CKA · SAA");
		expect(hire.packages[2].deliverables).toBe(
			"build/test/deploy + IaC gates; Grafana/Prometheus/CloudWatch + OpenTelemetry; runbook-ready dashboards",
		);
		expect(hire.packages[2].footnote).toBe("Tools used, not productized SKUs.");
		expect(hire.packages.map((pkg) => pkg.pain)).toEqual([
			"Spend is up. Visibility isn’t.",
			"Migrations stall. Platforms aren’t reproducible.",
			"Ships are slow. Incidents are loud.",
		]);

		for (const pkg of hire.packages) {
			const blob = `${pkg.title} ${pkg.pain} ${pkg.deliverables} ${pkg.bestFor} ${pkg.footnote ?? ""} ${pkg.credentials ?? ""}`;
			expect(blob).not.toMatch(FORBIDDEN_SKU);
			expect(blob).not.toMatch(/geniusee/i);
			expect(pkg.ctaLabel).toBe("Let’s talk");
			expect(pkg.ctaHref).toBe("#contact");
			expect(pkg.bestForLabel).toBe("Best for");
		}
	});

	it("locks v1.1 Who it’s for, How we engage, and FAQ copy", () => {
		expect(hire.audienceHeading).toBe("Who it’s for");
		expect(hire.audience.map((item) => item.line)).toEqual([
			"Engineering leads buried in ops toil",
			"CTOs watching cloud spend climb without a clear plan",
			"Product teams blocked by fragile delivery or noisy incidents",
		]);
		expect(hire.audience).toHaveLength(3);

		expect(hire.engageHeading).toBe("How we engage");
		expect(
			hire.engageSteps.map((step) => `${step.title} — ${step.detail}`),
		).toEqual([
			"Intake — short call, scope in writing",
			"Delivery — focused engagement, progress you can see",
			"Handoff — docs/runbooks; no lock-in",
		]);

		expect(hire.faqHeading).toBe("FAQ");
		expect(hire.faqs.map((item) => item.question)).toEqual([
			"Do I need a full-time DevOps hire?",
			"How soon can we start?",
			"Will you work with our existing stack?",
			"What happens after kickoff?",
		]);
		expect(hire.faqs.map((item) => item.answer)).toEqual([
			"Often no — a scoped engagement unblocks the bottleneck first.",
			"Usually within days after scope is agreed in writing.",
			"Yes — AWS-first; I meet your tools where they are.",
			"Delivery against the written scope, then a clean handoff.",
		]);

		const v11 = [
			hire.audienceHeading,
			...hire.audience.map((item) => item.line),
			hire.engageHeading,
			...hire.engageSteps.map((step) => `${step.title} ${step.detail}`),
			hire.faqHeading,
			...hire.faqs.map((item) => `${item.question} ${item.answer}`),
		].join("\n");
		expect(v11).not.toMatch(FORBIDDEN_SKU);
		expect(v11).not.toMatch(/geniusee/i);
	});

	it("deep-links locked proof teasers to the resume experience section", () => {
		expect(hire.proofTeasers.map((teaser) => teaser.line)).toEqual([
			"TFE migration in ~1 mo vs 3 planned (Luxoft / Mercedes)",
			"Network HA redesign — ~70% fewer incidents (scoped)",
			"Cloud cost cut — up to 50% (via Luxoft engagements)",
		]);

		for (const teaser of hire.proofTeasers) {
			expect(teaser.href).toBe("/#experience");
			expect(teaser.linkLabel).toBe("View on resume");
			expect(teaser.line).not.toMatch(FORBIDDEN_SKU);
		}

		expect(sourceOfTruth).toContain("70%");
		expect(sourceOfTruth).toContain("50%");
		expect(sourceOfTruth).toContain("Luxoft");
		expect(sourceOfTruth).toMatch(/1 month instead of 3 months/);
	});

	it("lists CKA, Terraform Associate, and AWS SAA badges that point at certifications", () => {
		expect(hire.badges.map((badge) => badge.label)).toEqual([
			"CKA",
			"Terraform Associate",
			"AWS SAA",
		]);
		for (const badge of hire.badges) {
			expect(badge.href).toBe("/#certifications");
		}

		const earnedTitles = certificates
			.filter((cert) => cert.link)
			.map((cert) => cert.title)
			.join(" ");
		expect(earnedTitles).toMatch(/Certified Kubernetes Administrator/);
		expect(earnedTitles).toMatch(/Terraform Associate/);
		expect(earnedTitles).toMatch(/Solutions Architect - Associate/);
	});

	it("keeps unique ids for keyed hire sections", () => {
		const ids = [
			...hire.audience.map((item) => item.id),
			...hire.packages.map((item) => item.id),
			...hire.proofTeasers.map((item) => item.id),
			...hire.engageSteps.map((item) => item.id),
			...hire.faqs.map((item) => item.id),
		];
		expect(ids.every((id) => id.length > 0)).toBe(true);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("keeps document/OG title off the locked H1", () => {
		expect(hire.headline).toBe(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);
		expect(hirePageMeta.title).toBe(
			"Hire DevOps (AWS & Kubernetes) | Q2 2027 | Andrii Lytvynenko",
		);
		expect(hirePageMeta.title).not.toBe(hire.headline);
		expect(hirePageMeta.description).toBe(
			"B2B DevOps from the EU — cloud cost & reliability, IaC/Kubernetes, CI/CD & observability. Case-study outcomes, not guarantees. Proof on the resume.",
		);
	});
});
