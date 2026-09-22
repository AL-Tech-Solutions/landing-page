export interface HirePackage {
	id: string;
	title: string;
	pain: string;
	bestForLabel: string;
	bestFor: string;
	deliverables: string;
	footnote?: string;
	credentials?: string;
	ctaLabel: string;
	ctaHref: string;
}

export interface HireAudienceItem {
	id: string;
	line: string;
}

export interface HireEngageStep {
	id: string;
	title: string;
	detail: string;
}

export interface HireFaqItem {
	id: string;
	question: string;
	answer: string;
}

export interface HireProofTeaser {
	id: string;
	line: string;
	linkLabel: string;
	href: string;
}

export interface HireBadge {
	label: string;
	href: string;
}

/** Locked contact disclaimer. Concatenate before + link + after to rebuild the exact sentence. */
export const HIRE_CONTACT_DISCLAIMER =
	"B2B inquiries only. I’ll use your message to reply and talk through a possible engagement (pre-contract). Details in the Privacy Policy. No obligation until we agree scope in writing.";

export const hire = {
	availability: "Available for Q2 2027 Projects",
	headline: "Hire DevOps that cuts cloud cost and keeps systems up.",
	offer: "AWS & Kubernetes · B2B from the EU · Proof on the resume",
	trustLine: "B2B · GDPR · Poland (EU)",
	ctaPrimary: "Let’s talk",
	ctaPrimaryHref: "#contact",
	ctaSecondary: "See full resume",
	ctaSecondaryHref: "/",
	audienceHeading: "Who it’s for",
	audience: [
		{
			id: "engineering-leads",
			line: "Engineering leads buried in ops toil",
		},
		{
			id: "cto",
			line: "CTOs watching cloud spend climb without a clear plan",
		},
		{
			id: "product-teams",
			line: "Product teams blocked by fragile delivery or noisy incidents",
		},
	] as HireAudienceItem[],
	packagesHeading: "Packages",
	packages: [
		{
			id: "cloud-cost-audit",
			title: "Cloud cost & reliability audit",
			pain: "Spend is up. Visibility isn’t.",
			bestForLabel: "Best for",
			bestFor: "teams bleeding spend or flying blind on HA/monitoring",
			deliverables:
				"Cost Explorer + Savings Plans/rightsizing; HA & monitoring gap review; prioritized quick wins with $ or risk impact",
			footnote: "Outcomes are case-study style — not guaranteed %.",
			ctaLabel: "Let’s talk",
			ctaHref: "#contact",
		},
		{
			id: "iac-kubernetes",
			title: "IaC & Kubernetes platforms",
			pain: "Migrations stall. Platforms aren’t reproducible.",
			bestForLabel: "Best for",
			bestFor: "Terraform/EKS (or ECS) delivery and migrations",
			deliverables:
				"Terraform/Terragrunt (TFE migration proof); EKS and/or ECS; HA (multi-AZ, ingress/LB, backup/restore)",
			credentials: "Terraform Assoc · CKA · SAA",
			ctaLabel: "Let’s talk",
			ctaHref: "#contact",
		},
		{
			id: "ci-cd-observability",
			title: "CI/CD & observability",
			pain: "Ships are slow. Incidents are loud.",
			bestForLabel: "Best for",
			bestFor: "pipeline + golden-signals maturity",
			deliverables:
				"build/test/deploy + IaC gates; Grafana/Prometheus/CloudWatch + OpenTelemetry; runbook-ready dashboards",
			footnote: "Tools used, not productized SKUs.",
			ctaLabel: "Let’s talk",
			ctaHref: "#contact",
		},
	] as HirePackage[],
	proofHeading: "Proof",
	proofTeasers: [
		{
			id: "tfe-migration",
			line: "TFE migration in ~1 mo vs 3 planned (Luxoft / Mercedes)",
			linkLabel: "View on resume",
			href: "/#experience",
		},
		{
			id: "network-ha",
			line: "Network HA redesign — ~70% fewer incidents (scoped)",
			linkLabel: "View on resume",
			href: "/#experience",
		},
		{
			id: "cloud-cost",
			line: "Cloud cost cut — up to 50% (via Luxoft engagements)",
			linkLabel: "View on resume",
			href: "/#experience",
		},
	] as HireProofTeaser[],
	badges: [
		{
			label: "CKA",
			href: "/#certifications",
		},
		{
			label: "Terraform Associate",
			href: "/#certifications",
		},
		{
			label: "AWS SAA",
			href: "/#certifications",
		},
	] as HireBadge[],
	engageHeading: "How we engage",
	engageSteps: [
		{
			id: "intake",
			title: "Intake",
			detail: "short call, scope in writing",
		},
		{
			id: "delivery",
			title: "Delivery",
			detail: "focused engagement, progress you can see",
		},
		{
			id: "handoff",
			title: "Handoff",
			detail: "docs/runbooks; no lock-in",
		},
	] as HireEngageStep[],
	faqHeading: "FAQ",
	faqs: [
		{
			id: "full-time",
			question: "Do I need a full-time DevOps hire?",
			answer: "Often no — a scoped engagement unblocks the bottleneck first.",
		},
		{
			id: "start",
			question: "How soon can we start?",
			answer: "Usually within days after scope is agreed in writing.",
		},
		{
			id: "existing-stack",
			question: "Will you work with our existing stack?",
			answer: "Yes — AWS-first; I meet your tools where they are.",
		},
		{
			id: "after-kickoff",
			question: "What happens after kickoff?",
			answer: "Delivery against the written scope, then a clean handoff.",
		},
	] as HireFaqItem[],
	contactHeading: "Let’s talk",
	contactCtaLabel: "Let’s talk",
	contactDisclaimerBefore:
		"B2B inquiries only. I’ll use your message to reply and talk through a possible engagement (pre-contract). Details in the ",
	contactDisclaimerLink: "Privacy Policy",
	contactDisclaimerAfter: ". No obligation until we agree scope in writing.",
	privacyPolicyHref: "/privacy-policy",
};

/** Document/OG title — not the locked H1 (`hire.headline`). */
export const hirePageMeta = {
	title: "Hire DevOps (AWS & Kubernetes) | Q2 2027 | Andrii Lytvynenko",
	description:
		"B2B DevOps from the EU — cloud cost & reliability, IaC/Kubernetes, CI/CD & observability. Case-study outcomes, not guarantees. Proof on the resume.",
};
