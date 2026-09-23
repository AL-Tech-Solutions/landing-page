import { describe, expect, it } from "vitest";
import { homePageMeta } from "@/data/seo";
import * as jsonLd from "@/lib/json-ld";
import { hire, hirePageMeta } from "@/data/hire";
import { certificates } from "@/data/certificates";

const { person, personJsonLd } = jsonLd;

const HIRE_FLAVORED_HOME = /Hire a Senior|Hire Senior DevOps/i;

function jsonOf(value: unknown) {
	return JSON.stringify(value);
}

describe("home meta is resume source of truth", () => {
	it("keeps the document title and resume-flavored descriptions", () => {
		expect(homePageMeta.title).toBe(
			"Andrii Lytvynenko - Senior DevOps & Cloud Engineer",
		);
		expect(homePageMeta.description).toBe(
			"Andrii Lytvynenko — Senior DevOps & Cloud Engineer. AWS, Kubernetes, Terraform. Cost and reliability proof on the resume. Based in Poland (EU) · B2B.",
		);
		expect(homePageMeta.ogTitle).toBe(
			"Andrii Lytvynenko | Senior DevOps & Cloud Engineer",
		);
		expect(homePageMeta.ogDescription).toBe(
			"Senior DevOps & Cloud Engineer — AWS, Kubernetes, Terraform. Cost and reliability proof on the resume. Poland (EU) · B2B.",
		);
	});

	it("does not use hire-flavored home strings", () => {
		const blob = jsonOf(homePageMeta);
		expect(blob).not.toMatch(HIRE_FLAVORED_HOME);
		expect(blob).not.toMatch(/Hire a Senior/i);
		expect(blob).not.toMatch(/AWS Certified \| B2B Contracts/i);
	});
});

describe("public JSON-LD", () => {
	it("keeps Person identity fields without employer, job-seeking, or email", () => {
		expect(personJsonLd["@type"]).toBe("Person");
		expect(personJsonLd.name).toBe("Andrii Lytvynenko");
		expect(personJsonLd.jobTitle).toBe("Senior DevOps & Cloud Engineer");
		expect(personJsonLd.url).toBe("https://alytvynenko.net/");
		expect(personJsonLd.image).toContain("tm-easy-profile.webp");
		expect(personJsonLd.sameAs.length).toBeGreaterThan(0);
		expect(personJsonLd.knowsAbout).toEqual(
			expect.arrayContaining(["AWS", "Kubernetes", "Terraform"]),
		);
		expect(personJsonLd.address).toMatchObject({
			"@type": "PostalAddress",
			addressCountry: "PL",
		});
		expect(personJsonLd.hasCredential.map((cred) => cred.name)).toEqual([
			"HashiCorp Certified: Terraform Associate",
			"AWS Certified AI Practitioner",
			"AWS Certified Cloud Practitioner",
			"Certified Kubernetes Administrator (CKA)",
			"AWS Certified Solutions Architect - Associate",
		]);
		expect(personJsonLd.hasCredential.map((cred) => cred.name)).toEqual(
			certificates
				.filter((cert) => Boolean(cert.link))
				.map((cert) => cert.title),
		);
		for (const planned of [
			"AWS Certified SysOps Administrator - Associate",
			"AWS Certified Solutions Architect - Professional",
		]) {
			expect(personJsonLd.hasCredential.map((cred) => cred.name)).not.toContain(
				planned,
			);
		}

		expect(personJsonLd).not.toHaveProperty("worksFor");
		expect(personJsonLd).not.toHaveProperty("seeks");
		expect(personJsonLd).not.toHaveProperty("email");
		expect(person).not.toHaveProperty("worksFor");
		expect(person).not.toHaveProperty("seeks");
		expect(person).not.toHaveProperty("email");

		const blob = jsonOf(personJsonLd);
		expect(blob).not.toMatch(/"worksFor"/);
		expect(blob).not.toMatch(/"seeks"/);
		expect(blob).not.toMatch(/JobPosting/);
		expect(blob).not.toMatch(/Geniusee/);
		expect(blob).not.toMatch(/@gmail\.com/);
	});

	it("strips OfferCatalog and ProfessionalService while the competitive hold stands", () => {
		expect(jsonLd).not.toHaveProperty("professionalServiceJsonLd");
		expect(jsonLd).not.toHaveProperty("offerCatalogJsonLd");
		expect(jsonOf(jsonLd)).not.toMatch(/OfferCatalog/);
		expect(jsonOf(jsonLd)).not.toMatch(/ProfessionalService/);
		expect(jsonOf(jsonLd)).not.toMatch(/Geniusee/);
		expect(jsonOf(personJsonLd)).not.toMatch(/"worksFor"/);
		expect(jsonOf(personJsonLd)).not.toMatch(/"seeks"/);
	});

	it("does not change the locked /hire H1", () => {
		expect(hire.headline).toBe(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);
	});
});

describe("/hire meta is document title, not H1", () => {
	it("uses the Q2 2027 document title for OG and Twitter", () => {
		expect(hirePageMeta.title).toBe(
			"Hire DevOps (AWS & Kubernetes) | Q2 2027 | Andrii Lytvynenko",
		);
		expect(hirePageMeta.description).toBe(
			"B2B DevOps from the EU — cloud cost & reliability, IaC/Kubernetes, CI/CD & observability. Case-study outcomes, not guarantees. Proof on the resume.",
		);
		expect(hirePageMeta.title).not.toBe(hire.headline);
	});
});
