import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { educations } from "@/data/education";
import { experiences } from "@/data/experiences";
import { profile } from "@/data/profile";
import { socialIconPaths } from "@/lib/iconPaths";

const ROOT = path.resolve(__dirname, "../..");

function onDisk(rel: string) {
	return existsSync(path.join(ROOT, rel));
}

function publicPath(href: string) {
	expect(href.startsWith("/")).toBe(true);
	return path.join("public", href.slice(1));
}

describe("resume surface assets exist on disk", () => {
	it("keeps the hero portrait and every company or university logo that data references", () => {
		expect(onDisk(publicPath(profile.profileImage))).toBe(true);

		for (const exp of experiences) {
			if (exp.company_logo) {
				expect(
					onDisk(`public/images/companies/${exp.company_logo}`),
					exp.company_logo,
				).toBe(true);
			}
			if (exp.client_logo) {
				expect(
					onDisk(`public/images/companies/${exp.client_logo}`),
					exp.client_logo,
				).toBe(true);
			}
		}

		for (const edu of educations) {
			if (edu.university_logo) {
				expect(
					onDisk(`public/images/education/${edu.university_logo}`),
					edu.university_logo,
				).toBe(true);
			}
		}
	});

	it("keeps PWA icons on disk and the manifest start URL plus theme color in lockstep with layout", () => {
		const manifest = JSON.parse(
			readFileSync(path.join(ROOT, "public/manifest.json"), "utf8"),
		) as {
			start_url: string;
			theme_color: string;
			icons: Array<{ src: string }>;
		};
		const layout = readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");

		expect(manifest.start_url).toBe("/");
		expect(manifest.theme_color).toBe("#3366CC");
		expect(layout).toContain('themeColor: "#3366CC"');
		expect(layout).toContain('manifest: "/manifest.json"');

		expect(manifest.icons.length).toBeGreaterThan(0);
		for (const icon of manifest.icons) {
			expect(onDisk(publicPath(icon.src)), icon.src).toBe(true);
		}
	});

	it("maps every contact and footer social icon to a real SVG path", () => {
		const icons = [
			...profile.socialLinks.map((link) => link.icon),
			...profile.footerSocialLinks.map((link) => link.icon),
			"email",
		];

		for (const icon of icons) {
			expect(socialIconPaths[icon], icon).toBeTruthy();
			expect(socialIconPaths[icon].length).toBeGreaterThan(20);
		}
	});
});
