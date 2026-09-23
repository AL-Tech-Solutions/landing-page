import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";
import {
	getAdditionalListItems,
	getAdditionalPlainHtml,
	truncateListHtml,
	truncatePlainText,
} from "@/lib/truncate-description";

const FIVE_BULLETS = `<ul>
<li>First</li>
<li>Second</li>
<li>Third</li>
<li>Fourth</li>
<li>Fifth with <strong>markup</strong></li>
</ul>`;

describe("truncateListHtml", () => {
	it("keeps short lists unchanged", () => {
		const html = "<ul><li>One</li><li>Two</li></ul>";
		expect(truncateListHtml(html, 4)).toEqual({
			truncated: html,
			full: html,
			needsExpand: false,
		});
		expect(truncateListHtml(html, 2)).toEqual({
			truncated: html,
			full: html,
			needsExpand: false,
		});
	});

	it("keeps the first N items and flags expand when there are more", () => {
		const result = truncateListHtml(FIVE_BULLETS, 4);
		expect(result.needsExpand).toBe(true);
		expect(result.full).toBe(FIVE_BULLETS);
		expect(result.truncated).toBe(
			"<ul><li>First</li><li>Second</li><li>Third</li><li>Fourth</li></ul>",
		);
		expect(result.truncated).not.toContain("Fifth");
	});

	it("does not treat markup without complete <li> pairs as a list to split", () => {
		const html = "<p>Not a list</p>";
		expect(truncateListHtml(html, 4)).toEqual({
			truncated: html,
			full: html,
			needsExpand: false,
		});
	});
});

describe("getAdditionalListItems", () => {
	it("returns inner HTML of bullets past the preview cap", () => {
		expect(getAdditionalListItems(FIVE_BULLETS, 4)).toEqual([
			"Fifth with <strong>markup</strong>",
		]);
	});

	it("returns an empty array when nothing is hidden", () => {
		expect(getAdditionalListItems("<ul><li>Only</li></ul>", 4)).toEqual([]);
		expect(getAdditionalListItems("<p>plain</p>", 4)).toEqual([]);
	});
});

describe("truncatePlainText", () => {
	it("keeps short copy, including tags, unchanged", () => {
		const html = "<p>Short proof point.</p>";
		expect(truncatePlainText(html, 300)).toEqual({
			truncated: html,
			full: html,
			needsExpand: false,
		});
	});

	it("strips tags for length, cuts on a word boundary, and wraps a preview", () => {
		const html = `<p>${Array.from({ length: 20 }, () => "word").join(" ")}</p>`;
		const result = truncatePlainText(html, 40);
		expect(result.needsExpand).toBe(true);
		expect(result.full).toBe(html);
		expect(result.truncated).toMatch(/^<p>word(?: word)*…<\/p>$/);
		const preview = result.truncated.replace(/<\/?p>/g, "").replace(/…$/, "");
		expect(preview.length).toBeLessThanOrEqual(40);
		expect(preview.endsWith("word")).toBe(true);
		expect(preview.split(" ").every((token) => token === "word")).toBe(true);
	});

	it("cuts at maxChars when the preview has no space", () => {
		const html = "A".repeat(20);
		expect(truncatePlainText(html, 8)).toEqual({
			truncated: `<p>${"A".repeat(8)}…</p>`,
			full: html,
			needsExpand: true,
		});
	});
});

describe("getAdditionalPlainHtml", () => {
	it("returns the leftover stripped text in a paragraph", () => {
		expect(getAdditionalPlainHtml("<p>alpha bravo charlie</p>", 6)).toBe(
			"<p>bravo charlie</p>",
		);
	});

	it("returns null when the stripped text fits", () => {
		expect(getAdditionalPlainHtml("<p>short</p>", 300)).toBeNull();
	});
});

describe("Experience and Education HTML stays list-parseable", () => {
	it("lets the default 4-bullet preview hide overflow on long roles", () => {
		const entries = [
			...experiences.map((exp) => `${exp.company} / ${exp.client}`),
			...educations.map((edu) => edu.university_title),
		];
		const descriptions = [
			...experiences.map((exp) => exp.description),
			...educations.map((edu) => edu.description),
		];

		expect(entries.length).toBe(descriptions.length);

		descriptions.forEach((html, index) => {
			expect(html, entries[index]).toMatch(/<ul>[\s\S]*<\/ul>/);
			const items = html.match(/<li>[\s\S]*?<\/li>/g);
			expect(items?.length, entries[index]).toBeGreaterThan(0);

			const preview = truncateListHtml(html, 4);
			const extra = getAdditionalListItems(html, 4);
			if ((items?.length ?? 0) > 4) {
				expect(preview.needsExpand, entries[index]).toBe(true);
				expect(extra.length, entries[index]).toBe((items?.length ?? 0) - 4);
			} else {
				expect(preview.needsExpand, entries[index]).toBe(false);
				expect(extra, entries[index]).toEqual([]);
			}
		});
	});
});
