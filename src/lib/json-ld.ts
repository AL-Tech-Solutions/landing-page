import { certificates } from "@/data/certificates";

const SITE_URL = "https://alytvynenko.net";
const SITE_ORIGIN = `${SITE_URL}/`;
const PROFILE_IMAGE = `${SITE_URL}/images/tm-easy-profile.webp`;

const personAddress = {
	"@type": "PostalAddress",
	addressLocality: "Częstochowa",
	addressRegion: "Silesian Voivodeship",
	addressCountry: "PL",
};

/**
 * Public Person node for JSON-LD. Omits email, employer `worksFor`, and
 * `seeks` / JobPosting — those do not belong on the public schema.
 * Acquisition types (OfferCatalog, ProfessionalService) stay off while the
 * competitive hold stands. Do not reintroduce Geniusee.
 */
export const person = {
	"@type": "Person",
	name: "Andrii Lytvynenko",
	jobTitle: "Senior DevOps & Cloud Engineer",
	url: SITE_ORIGIN,
	image: PROFILE_IMAGE,
	address: personAddress,
	sameAs: [
		"https://www.linkedin.com/in/andrii-fecton/",
		"https://github.com/fecton",
		"https://www.facebook.com/andrii.lytvynenko.official",
		"https://www.instagram.com/andrii.lytvynenko/",
		"https://t.me/fecton",
	],
	knowsAbout: [
		"DevOps",
		"Cloud Engineering",
		"AWS",
		"Terraform",
		"Kubernetes",
		"Docker",
		"CI/CD",
		"Infrastructure as Code",
		"Jenkins",
		"Python",
		"Bash",
		"Linux",
	],
	hasCredential: certificates
		.filter((cert) => Boolean(cert.link))
		.map((cert) => ({
			"@type": "EducationalOccupationalCredential",
			name: cert.title,
			credentialCategory: "Professional Certification",
		})),
};

export const personJsonLd = {
	"@context": "https://schema.org",
	...person,
};

/** JSON-LD for a script tag: escape `<` so a value cannot break into HTML. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
