import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { certificates } from "@/data/certificates";
import { profile } from "@/data/profile";
import { personJsonLd } from "@/lib/json-ld";

const ROOT = path.resolve(__dirname, "../..");
const CERT_DIR = path.join(ROOT, "public/images/certification");
const CREDLY_PUBLIC_URL =
	/^https:\/\/www\.credly\.com\/badges\/[a-f0-9-]+\/public_url$/;

const earned = certificates.filter((cert) => Boolean(cert.link));
const planned = certificates.filter((cert) => Boolean(cert.planned_year));

describe("certificate earned vs planned invariant", () => {
	it("makes every certificate either earned or planned, never both or neither", () => {
		expect(certificates.length).toBeGreaterThan(0);

		for (const cert of certificates) {
			const hasLink = Boolean(cert.link);
			const hasYear = Boolean(cert.planned_year);
			expect(
				hasLink !== hasYear,
				`${cert.title} must have exactly one of link or planned_year`,
			).toBe(true);
		}

		expect(earned.length + planned.length).toBe(certificates.length);
	});

	it("uses Credly public URLs for earned certs and a four-digit target year for planned ones", () => {
		expect(earned.length).toBeGreaterThan(0);
		expect(planned.length).toBeGreaterThan(0);

		for (const cert of earned) {
			expect(cert.link).toMatch(CREDLY_PUBLIC_URL);
			expect(cert.planned_year).toBe("");
		}

		for (const cert of planned) {
			expect(cert.link).toBe("");
			expect(cert.planned_year).toMatch(/^\d{4}$/);
		}
	});

	it("keeps titles unique so CertificationsCard keys and JSON-LD names cannot collide", () => {
		const titles = certificates.map((cert) => cert.title);
		expect(new Set(titles).size).toBe(titles.length);
	});
});

describe("certificate proof assets and public claims", () => {
	it("ships a WebP badge on disk for every certificate", () => {
		for (const cert of certificates) {
			expect(cert.image).toMatch(/^[a-z0-9-]+\.webp$/);
			expect(
				existsSync(path.join(CERT_DIR, cert.image)),
				`missing ${cert.image}`,
			).toBe(true);
		}
	});

	it("keeps the highlights count aligned with earned certificates only", () => {
		const highlight = profile.highlights.find((item) =>
			/certifications/i.test(item.label),
		);
		expect(highlight).toBeDefined();
		expect(highlight?.number).toBe(`${earned.length}+`);
		expect(personJsonLd.hasCredential).toHaveLength(earned.length);
	});
});
