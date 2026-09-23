import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { profile } from "@/data/profile";
import {
	getViewerDocument,
	viewerDocumentSlugs,
	viewerDocuments,
	viewerHrefForPdf,
	viewerStaticParams,
} from "@/data/viewer-documents";

const ROOT = path.resolve(__dirname, "../..");
const PUBLIC_PDF = path.join(ROOT, "public", "pdf");

describe("PDF viewer allowlist", () => {
	it("only publishes resume, diploma, and diploma-supplement", () => {
		expect(viewerDocumentSlugs).toEqual([
			"resume",
			"diploma",
			"diploma-supplement",
		]);
		expect(viewerStaticParams()).toEqual([
			{ document: "resume" },
			{ document: "diploma" },
			{ document: "diploma-supplement" },
		]);
	});

	it("keeps each src as a same-origin /pdf/<slug>.pdf file that exists", () => {
		for (const slug of viewerDocumentSlugs) {
			const doc = viewerDocuments[slug];
			expect(doc.src).toBe(`/pdf/${slug}.pdf`);
			expect(doc.src).toMatch(/^\/pdf\/[a-z0-9-]+\.pdf$/);
			expect(doc.src).not.toMatch(/\.\.|\/\/|:/);
			expect(existsSync(path.join(PUBLIC_PDF, `${slug}.pdf`))).toBe(true);
		}
	});

	it("keeps download names as a single basename with no path separators", () => {
		for (const slug of viewerDocumentSlugs) {
			const { downloadName } = viewerDocuments[slug];
			expect(downloadName).toMatch(/\.pdf$/);
			expect(downloadName).not.toMatch(/[/\\]|^\.+$|\.\./);
		}
	});

	it("rejects unknown, cased, and traversal slugs", () => {
		for (const slug of [
			"",
			"RESUME",
			"resume.pdf",
			"resume/",
			"../resume",
			"diploma/../resume",
			"..%2fresume",
			"https://example.com/x.pdf",
			"cookie-policy",
		]) {
			expect(getViewerDocument(slug)).toBeUndefined();
		}
	});
});

describe("viewerHrefForPdf", () => {
	it("maps allowlisted srcs to in-app viewer routes", () => {
		expect(viewerHrefForPdf("/pdf/resume.pdf")).toBe("/viewer/resume");
		expect(viewerHrefForPdf("/pdf/diploma.pdf")).toBe("/viewer/diploma");
		expect(viewerHrefForPdf("/pdf/diploma-supplement.pdf")).toBe(
			"/viewer/diploma-supplement",
		);
	});

	it("does not map off-allowlist or remote paths", () => {
		expect(viewerHrefForPdf("")).toBeUndefined();
		expect(viewerHrefForPdf("/pdf/../etc/passwd")).toBeUndefined();
		expect(viewerHrefForPdf("/pdf/other.pdf")).toBeUndefined();
		expect(viewerHrefForPdf("https://evil.example/resume.pdf")).toBeUndefined();
		expect(viewerHrefForPdf("/viewer/resume")).toBeUndefined();
	});
});

describe("viewer data stays aligned with Education and resume", () => {
	it("uses the same resume PDF as the profile download", () => {
		expect(profile.resumeUrl).toBe(viewerDocuments.resume.src);
	});

	it("routes Education diploma PDFs through the allowlisted viewer", () => {
		const withDiploma = educations.filter(
			(edu) => edu.diploma_pdf || edu.diploma_supplement_pdf,
		);
		expect(withDiploma.length).toBeGreaterThan(0);

		for (const edu of educations) {
			if (edu.diploma_pdf) {
				expect(viewerHrefForPdf(edu.diploma_pdf)).toBeDefined();
			}
			if (edu.diploma_supplement_pdf) {
				expect(viewerHrefForPdf(edu.diploma_supplement_pdf)).toBeDefined();
			}
		}
	});
});
