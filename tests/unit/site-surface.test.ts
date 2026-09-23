import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import { educations } from "@/data/education";
import { hireHref } from "@/data/nav";
import { profile } from "@/data/profile";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function publicFile(urlPath: string) {
	return path.join(ROOT, "public", urlPath.replace(/^\//, ""));
}

describe("static export / GitHub Pages contract", () => {
	it("keeps static export, trailing slashes, and unoptimized images", () => {
		expect(nextConfig.output).toBe("export");
		expect(nextConfig.trailingSlash).toBe(true);
		expect(nextConfig.images?.unoptimized).toBe(true);
	});

	it("pins the custom domain and disables Jekyll", () => {
		expect(read("public/CNAME").trim()).toBe("alytvynenko.net");
		expect(existsSync(path.join(ROOT, "public/.nojekyll"))).toBe(true);
	});

	it("keeps the PWA start URL on the home origin", () => {
		const manifest = JSON.parse(read("public/manifest.json")) as {
			start_url: string;
			name: string;
			theme_color: string;
		};
		expect(manifest.start_url).toBe("/");
		expect(manifest.name).toMatch(/Andrii Lytvynenko/);
		expect(manifest.theme_color).toBe("#3366CC");
	});
});

describe("sitemap and robots", () => {
	const sitemap = read("public/sitemap.xml");
	const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
		(match) => match[1],
	);

	it("lists public https pages with trailing slashes and excludes viewer", () => {
		expect(locs).toEqual(
			expect.arrayContaining([
				"https://alytvynenko.net/",
				"https://alytvynenko.net/hire/",
				"https://alytvynenko.net/privacy-policy/",
				"https://alytvynenko.net/cookie-policy/",
			]),
		);
		expect(locs).toContain(`https://alytvynenko.net${hireHref}`);
		expect(locs.some((loc) => loc.includes("/viewer/"))).toBe(false);

		for (const loc of locs) {
			expect(loc.startsWith("https://alytvynenko.net/")).toBe(true);
			expect(loc.endsWith("/")).toBe(true);
			expect(loc).not.toMatch(/javascript:|data:|vbscript:/i);
		}
	});

	it("points robots.txt at the same-origin sitemap", () => {
		const robots = read("public/robots.txt");
		expect(robots).toMatch(/User-agent:\s*\*/);
		expect(robots).toMatch(/Allow:\s*\//);
		expect(robots).toContain("Sitemap: https://alytvynenko.net/sitemap.xml");
	});
});

describe("resume and diploma assets", () => {
	it("keeps profile resume and education PDFs on disk as same-origin /pdf files", () => {
		expect(profile.resumeUrl).toBe("/pdf/resume.pdf");
		expect(existsSync(publicFile(profile.resumeUrl))).toBe(true);

		const pdfHrefs = [
			profile.resumeUrl,
			...educations.flatMap((edu) => [
				edu.diploma_pdf,
				edu.diploma_supplement_pdf,
			]),
		].filter(Boolean);

		for (const href of pdfHrefs) {
			expect(href).toMatch(/^\/pdf\/[^./][^/]*\.pdf$/);
			expect(href).not.toContain("..");
			expect(existsSync(publicFile(href))).toBe(true);
		}
	});

	it("does not attach diploma files to the Academic lab or EPAM entries", () => {
		const lab = educations.find(
			(edu) => edu.university_title === "devops-skill-demonstration",
		);
		const epam = educations.find(
			(edu) => edu.university_title === "EPAM University",
		);
		expect(lab?.diploma_pdf).toBe("");
		expect(lab?.diploma_supplement_pdf).toBe("");
		expect(epam?.diploma_pdf).toBe("");
		expect(epam?.diploma_supplement_pdf).toBe("");
	});
});

describe("root layout stays consent-first", () => {
	it("does not inject gtag in layout and wraps the tree in ConsentProvider", () => {
		const layout = read("src/app/layout.tsx");
		expect(layout).not.toMatch(/googletagmanager|gtag\(/);
		expect(layout).toContain("ConsentProvider");
		expect(layout).toContain("personJsonLd");
		expect(layout).toContain('href="#main-content"');
	});
});
