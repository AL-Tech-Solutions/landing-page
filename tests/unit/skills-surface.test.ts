import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";
import { skillIconMap } from "@/data/skillIcons";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

function skillsCardIconKeys(): string[] {
	const source = read("src/components/bento/SkillsCard.tsx");
	const block = source.match(
		/const iconPaths: Record<string, string> = \{([\s\S]*?)\n\};/,
	);
	expect(block, "SkillsCard iconPaths map").toBeTruthy();
	return [...block![1].matchAll(/^\t(\w+):/gm)].map((match) => match[1]);
}

describe("SkillsCard data can render without dropping icons", () => {
	it("maps every listed skill to an exact skillIconMap entry", () => {
		expect(profile.skills.length).toBeGreaterThan(0);

		const titles = profile.skills.map((category) => category.title);
		expect(new Set(titles).size).toBe(titles.length);

		for (const category of profile.skills) {
			expect(category.skills.length).toBeGreaterThan(0);
			expect(new Set(category.skills).size).toBe(category.skills.length);

			for (const skill of category.skills) {
				expect(
					skillIconMap[skill],
					`${category.title} → ${skill} needs an exact skillIconMap key`,
				).toEqual(
					expect.objectContaining({
						path: expect.any(String),
						title: expect.any(String),
					}),
				);
				expect(skillIconMap[skill].path.length).toBeGreaterThan(20);
			}
		}
	});

	it("keeps primary highlights as a subset of that category's skills", () => {
		for (const category of profile.skills) {
			for (const primary of category.primary ?? []) {
				expect(category.skills, category.title).toContain(primary);
			}
		}
	});

	it("resolves every category icon key in SkillsCard", () => {
		const iconKeys = skillsCardIconKeys();
		expect(iconKeys.length).toBeGreaterThan(0);

		for (const category of profile.skills) {
			expect(iconKeys, category.icon).toContain(category.icon);
		}
	});
});
