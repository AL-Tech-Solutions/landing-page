import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { certificates } from "@/data/certificates";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";
import { hire } from "@/data/hire";
import { profile } from "@/data/profile";
import { person } from "@/lib/json-ld";
import { socialIconPaths } from "@/lib/iconPaths";

const ROOT = path.resolve(__dirname, "../..");

const UNSAFE_SCHEME = /^(javascript|data|vbscript|file):/i;

function hrefsFromHtml(html: string): string[] {
	return [...html.matchAll(/\bhref="([^"]+)"/gi)].map((match) => match[1]);
}

function assertSafePublicUrl(url: string, label: string) {
	expect(url, label).toBe(url.trim());
	expect(url, `${label} must not use a dangerous scheme`).not.toMatch(
		UNSAFE_SCHEME,
	);
	if (url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:")) {
		expect(url, `${label} must not traverse`).not.toMatch(/\.\./);
		return;
	}
	expect(url, `${label} must be https`).toMatch(/^https:\/\//);
}

describe("public outbound URLs", () => {
	it("keeps data hrefs https, mailto, or same-origin — never javascript:", () => {
		const labeled: Array<[string, string]> = [];
		const add = (url: string, label: string) => {
			labeled.push([url, label]);
		};

		experiences.forEach((exp, index) => {
			add(exp.company_link, `experiences[${index}].company_link`);
			add(exp.client_link, `experiences[${index}].client_link`);
			for (const href of hrefsFromHtml(exp.description)) {
				add(href, `experiences[${index}].description ${href}`);
			}
		});

		educations.forEach((edu, index) => {
			add(edu.university_link, `educations[${index}].university_link`);
			add(edu.diploma_pdf, `educations[${index}].diploma_pdf`);
			add(
				edu.diploma_supplement_pdf,
				`educations[${index}].diploma_supplement_pdf`,
			);
			for (const href of hrefsFromHtml(edu.description)) {
				add(href, `educations[${index}].description ${href}`);
			}
		});

		certificates.forEach((cert, index) => {
			add(cert.link, `certificates[${index}].link`);
		});
		for (const link of profile.socialLinks) {
			add(link.url, `profile.socialLinks.${link.name}`);
		}
		for (const link of profile.footerSocialLinks) {
			add(link.url, `profile.footerSocialLinks.${link.name}`);
		}
		add(profile.resumeUrl, "profile.resumeUrl");
		add(`mailto:${profile.email}`, "profile.email");
		add(hire.ctaPrimaryHref, "hire.ctaPrimaryHref");
		add(hire.ctaSecondaryHref, "hire.ctaSecondaryHref");
		add(hire.privacyPolicyHref, "hire.privacyPolicyHref");
		person.sameAs.forEach((url, index) => {
			add(url, `person.sameAs[${index}]`);
		});

		for (const [url, label] of labeled) {
			if (!url) continue;
			assertSafePublicUrl(url, label);
		}
	});
});

describe("referenced assets and icon keys exist", () => {
	it("resolves every social icon key used in the profile", () => {
		const icons = [
			...profile.socialLinks.map((link) => link.icon),
			...profile.footerSocialLinks.map((link) => link.icon),
		];
		expect(icons.length).toBeGreaterThan(0);
		for (const icon of icons) {
			expect(socialIconPaths[icon], `missing icon path for ${icon}`).toEqual(
				expect.any(String),
			);
			expect(socialIconPaths[icon].length).toBeGreaterThan(0);
		}
	});

	it("keeps earned certs on Credly and planned certs linkless", () => {
		for (const cert of certificates) {
			const imagePath = path.join(
				ROOT,
				"public",
				"images",
				"certification",
				cert.image,
			);
			expect(existsSync(imagePath), cert.image).toBe(true);

			if (cert.planned_year) {
				expect(cert.planned_year).toMatch(/^\d{4}$/);
				expect(cert.link).toBe("");
			} else {
				expect(cert.link).toMatch(/^https:\/\/www\.credly\.com\/badges\//);
			}
		}
	});

	it("keeps company and university logos on disk when referenced", () => {
		for (const exp of experiences) {
			if (exp.company_logo) {
				expect(
					existsSync(
						path.join(ROOT, "public", "images", "companies", exp.company_logo),
					),
					exp.company_logo,
				).toBe(true);
			}
			if (exp.client_logo) {
				expect(
					existsSync(
						path.join(ROOT, "public", "images", "companies", exp.client_logo),
					),
					exp.client_logo,
				).toBe(true);
			}
		}

		for (const edu of educations) {
			if (!edu.university_logo) continue;
			expect(
				existsSync(
					path.join(ROOT, "public", "images", "education", edu.university_logo),
				),
				edu.university_logo,
			).toBe(true);
		}
	});
});
