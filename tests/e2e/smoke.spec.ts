import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Verify a single element is rendered AND visible (not stuck behind a broken
// animation at opacity 0). The framer-motion bugs we kept hitting all looked
// fine to TS/lint but rendered with opacity:0 — this assertion catches them.
async function assertVisible(page: Page, selector: string, label: string) {
	const el = page.locator(selector).first();
	await expect(el, `${label} not in DOM`).toBeVisible();
	const opacity = await el.evaluate((node) => {
		return parseFloat(window.getComputedStyle(node).opacity);
	});
	expect(opacity, `${label} computed opacity is ${opacity}`).toBeGreaterThan(
		0.5,
	);
}

test.describe("home page renders", () => {
	test("hero, navbar, and every bento card are visible", async ({ page }) => {
		await page.goto("/");
		// Dismiss the cookie banner so it doesn't overlay anything we measure.
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		await assertVisible(page, "nav", "Navbar");
		await assertVisible(page, "h1", "Hero h1");
		await assertVisible(page, 'img[alt*="Andrii Lytvynenko"]', "Hero portrait");

		// Each bento section must render its first card visible.
		for (const heading of [
			"About Me",
			"Key Highlights",
			"Technical Skills",
			"Certifications",
			"Contact",
			"Languages",
			"Experience",
			"Education",
			"Writing",
		]) {
			const h2 = page.getByRole("heading", { level: 2, name: heading });
			await expect(h2, `${heading} h2 missing`).toBeVisible();
		}

		// All articles must have non-zero opacity (catches the GlassCard bug).
		const invisibleArticles = await page.evaluate(() => {
			return Array.from(document.querySelectorAll("article")).filter(
				(a) => parseFloat(window.getComputedStyle(a).opacity) < 0.5,
			).length;
		});
		expect(invisibleArticles, "articles stuck at opacity 0").toBe(0);
	});

	test("hero copy, CTAs, and resume page match the above-fold handoff", async ({
		page,
	}) => {
		await page.goto("/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Cloud infrastructure that costs less and stays up.",
		);
		await expect(
			page.getByText("Available for Q2 2027 Projects"),
		).toBeVisible();
		await expect(
			page.getByText(
				"Senior DevOps & Cloud Engineer — AWS & Kubernetes, B2B from the EU. Enterprise work via Luxoft (JPMorgan Chase / Mercedes-Benz): up to 50% cloud cost reduction, ~70% fewer incidents.",
			),
		).toBeVisible();
		await expect(page.getByText("B2B · GDPR · Poland (EU)")).toBeVisible();
		await expect(page.getByText("GDPR Compliant")).toHaveCount(0);
		await expect(page.getByRole("link", { name: "View Resume" })).toHaveCount(
			0,
		);

		await expect(
			page.getByText(
				"My experience includes enterprise client work via Luxoft — notably JPMorgan Chase and Mercedes-Benz — delivering infrastructure migrations, cutting cloud costs by up to 50%, and architecting high-availability systems that handle hundreds of thousands of requests per second.",
			),
		).toBeVisible();

		const highlights = page
			.getByRole("heading", { level: 2, name: "Key Highlights" })
			.locator("..");
		await expect(highlights.getByText("Up to 50%")).toBeVisible();
		await expect(
			highlights.getByText("Cost reduction (Luxoft engagements)"),
		).toBeVisible();
		await expect(highlights.getByText("~70%")).toBeVisible();
		await expect(
			highlights.getByText("Fewer incidents (Mercedes-Benz / Luxoft)"),
		).toBeVisible();
		await expect(page.getByText("Cloud Certifications")).toHaveCount(0);

		const talk = page.getByRole("link", { name: "Let’s talk" });
		await expect(talk).toBeVisible();
		await expect(talk).toHaveAttribute("href", "#contact");
		await talk.click();
		await expect(
			page.getByRole("heading", { level: 2, name: "Contact" }),
		).toBeVisible();

		const downloadResume = page.getByRole("link", { name: "Download resume" });
		await expect(downloadResume).toBeVisible();
		await expect(downloadResume).toHaveAttribute("href", /resume\.pdf$/);

		const contactCard = page
			.getByRole("heading", { level: 2, name: "Contact" })
			.locator("..");
		await expect(
			contactCard.getByText(
				/B2B inquiries only\. I’ll use your message to reply/,
			),
		).toBeVisible();
		await expect(
			contactCard.getByRole("link", { name: "Privacy Policy" }),
		).toHaveAttribute("href", /\/privacy-policy\/?/);

		await page.goto("/resume/");
		await expect(page.locator("iframe")).toBeVisible();
		await expect(page.locator("a[download]")).toContainText(/Download/i);
	});

	test("primary nav is About Experience Resume Contact; Hire is unlinked chrome", async ({
		page,
	}) => {
		await page.goto("/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		const nav = page.locator("nav");
		const menuButton = page.getByRole("button", { name: /Open menu/i });
		if (await menuButton.isVisible()) {
			await menuButton.click();
		}

		const navLabels = (await nav.getByRole("link").allTextContents())
			.map((label) => label.trim())
			.filter((label) =>
				[
					"About",
					"Experience",
					"Resume",
					"Hire",
					"Contact",
					"Work",
					"Proof",
				].includes(label),
			);
		expect(navLabels).toEqual(["About", "Experience", "Resume", "Contact"]);

		await expect(nav.getByRole("link", { name: "Hire" })).toHaveCount(0);
		await expect(nav.getByRole("link", { name: "Work" })).toHaveCount(0);
		await expect(nav.getByRole("link", { name: "Proof" })).toHaveCount(0);
		await expect(nav.getByRole("link", { name: "Privacy" })).toHaveCount(0);
		await expect(
			page.locator("footer").getByRole("link", { name: "Hire" }),
		).toHaveCount(0);
		await expect(
			page.locator("footer").getByRole("link", { name: "Privacy Policy" }),
		).toBeVisible();
	});

	test("homepage soft CTA is resume-only and /hire stays live unlinked", async ({
		page,
	}) => {
		await page.goto("/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		const hero = page.locator("#main-content > section").first();
		await expect(hero.getByRole("link", { name: "Let’s talk" })).toBeVisible();
		await expect(
			hero.getByRole("link", { name: "Download resume" }),
		).toBeVisible();
		await expect(hero.getByRole("link", { name: "Hire" })).toHaveCount(0);
		await expect(hero.getByRole("link", { name: "Work" })).toHaveCount(0);
		await expect(hero.getByRole("link", { name: "Proof" })).toHaveCount(0);

		const menuButton = page.getByRole("button", { name: /Open menu/i });
		if (await menuButton.isVisible()) {
			await menuButton.click();
		}
		await expect(
			page.locator("nav").getByRole("link", { name: "Hire" }),
		).toHaveCount(0);

		await page.goto("/hire/");
		await expect(page).toHaveURL(/\/hire\/?/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);
	});

	test("experience and education accordions have unique ids and live aria-controls", async ({
		page,
	}) => {
		await page.goto("/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		const triggers = page.getByRole("button", {
			name: /Expand to show (Technologies & Skills|Courses & Disciplines)/i,
		});
		const count = await triggers.count();
		expect(count).toBe(9);

		const ids: string[] = [];
		const controls: string[] = [];
		for (let i = 0; i < count; i++) {
			const trigger = triggers.nth(i);
			const id = await trigger.getAttribute("id");
			const ariaControls = await trigger.getAttribute("aria-controls");
			expect(id, "accordion trigger is missing id").toBeTruthy();
			expect(
				ariaControls,
				"accordion trigger is missing aria-controls",
			).toBeTruthy();
			if (!id || !ariaControls) {
				throw new Error("accordion trigger missing id or aria-controls");
			}
			ids.push(id);
			controls.push(ariaControls);

			const targetExists = await page.evaluate(
				(targetId) => Boolean(document.getElementById(targetId)),
				ariaControls,
			);
			expect(
				targetExists,
				`aria-controls="${ariaControls}" missing from DOM`,
			).toBe(true);
		}

		expect(new Set(ids).size).toBe(ids.length);
		expect(new Set(controls).size).toBe(controls.length);
		expect(ids).not.toContain("technologies-&-skills-trigger");
		expect(ids).not.toContain("courses-&-disciplines-trigger");
		expect(ids.every((id) => !id.includes("&"))).toBe(true);
	});

	test("features devops-skill-demonstration as Academic/labs in Education", async ({
		page,
	}) => {
		await page.goto("/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		const education = page.getByRole("region", { name: "Education" });
		const lab = education.locator("article").filter({
			has: page.getByRole("heading", {
				level: 3,
				name: "GCP/GKE platform lab",
			}),
		});

		await expect(lab).toBeVisible();
		await expect(lab.getByText("Academic lab")).toBeVisible();
		await expect(
			lab.getByRole("link", { name: "devops-skill-demonstration" }),
		).toHaveAttribute("href", "https://github.com/devops-skill-demonstration");
		await expect(
			lab.getByText(
				"Diploma project (KhAI): GCP/GKE platform lab with layered Terraform (init → in-cluster ops → config) and observability — skills demonstration, not a client engagement.",
			),
		).toBeVisible();
		await expect(
			lab.getByRole("link", { name: "GitHub repository: 0-documentation" }),
		).toHaveAttribute(
			"href",
			"https://github.com/devops-skill-demonstration/0-documentation",
		);

		const experience = page.getByRole("region", { name: "Experience" });
		await expect(
			experience.getByText("devops-skill-demonstration"),
		).toHaveCount(0);
		await expect(
			experience.getByText("skills demonstration, not a client engagement"),
		).toHaveCount(0);
	});

	test("home meta is resume SoT, not hire-flavored", async ({ page }) => {
		await page.goto("/");

		await expect(page).toHaveTitle(
			"Andrii Lytvynenko - Senior DevOps & Cloud Engineer",
		);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"Andrii Lytvynenko — Senior DevOps & Cloud Engineer. AWS, Kubernetes, Terraform. Cost and reliability proof on the resume. Based in Poland (EU) · B2B.",
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			"content",
			"Andrii Lytvynenko | Senior DevOps & Cloud Engineer",
		);
		await expect(
			page.locator('meta[property="og:description"]'),
		).toHaveAttribute(
			"content",
			"Senior DevOps & Cloud Engineer — AWS, Kubernetes, Terraform. Cost and reliability proof on the resume. Poland (EU) · B2B.",
		);
		await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
			"content",
			"Andrii Lytvynenko | Senior DevOps & Cloud Engineer",
		);
		await expect(
			page.locator('meta[name="twitter:description"]'),
		).toHaveAttribute(
			"content",
			"Senior DevOps & Cloud Engineer — AWS, Kubernetes, Terraform. Cost and reliability proof on the resume. Poland (EU) · B2B.",
		);

		const head = await page.locator("head").innerHTML();
		expect(head).not.toMatch(/Hire a Senior/i);
		expect(head).not.toMatch(/Hire Senior DevOps/i);

		const graphs = (
			await page.locator('script[type="application/ld+json"]').allTextContents()
		).map((text) => JSON.parse(text) as Record<string, unknown>);
		const types = graphs.map((graph) => graph["@type"]);
		expect(types).toContain("Person");
		expect(types).not.toContain("ProfessionalService");
		expect(types).not.toContain("OfferCatalog");
		expect(JSON.stringify(graphs)).not.toMatch(/"worksFor"/);
		expect(JSON.stringify(graphs)).not.toMatch(/JobPosting/);
		expect(JSON.stringify(graphs)).not.toMatch(/@gmail\.com/);
	});
});

test.describe("subpages render with navigation", () => {
	// These pages have a real <h1>.
	for (const { path, h1 } of [
		{ path: "/privacy-policy/", h1: /Privacy Policy/i },
		{ path: "/cookie-policy/", h1: /Cookie Policy/i },
		{
			path: "/hire/",
			h1: /Hire DevOps that cuts cloud cost and keeps systems up/i,
		},
		{ path: "/writing/", h1: /^Writing$/ },
	]) {
		test(`${path} renders nav + footer + h1`, async ({ page }) => {
			await page.goto(path);
			await expect(page.locator("nav")).toBeVisible();
			await expect(page.locator("footer")).toBeVisible();
			await expect(page.locator("h1")).toContainText(h1);
		});
	}

	// Viewer pages don't have an <h1> — they're a back button + download CTA + iframe.
	for (const path of ["/viewer/diploma/", "/viewer/diploma-supplement/"]) {
		test(`${path} renders nav + footer + iframe + download`, async ({
			page,
		}) => {
			await page.goto(path);
			await expect(page.locator("nav")).toBeVisible();
			await expect(page.locator("footer")).toBeVisible();
			await expect(page.locator("iframe")).toBeVisible();
			await expect(page.locator("a[download]")).toBeVisible();
		});
	}

	test("404 page has navbar + footer (regression: pass-3)", async ({
		page,
	}) => {
		const response = await page.goto("/this-route-does-not-exist/", {
			waitUntil: "domcontentloaded",
		});
		// Static export serves 404.html for missing routes — status may be 200 from
		// `serve` but the page should still be the 404 component.
		expect(await page.locator("h1").textContent()).toContain("404");
		await expect(page.locator("nav")).toBeVisible();
		await expect(page.locator("footer")).toBeVisible();
	});
});

test.describe("accessibility", () => {
	test("home page has no serious or critical axe violations", async ({
		page,
	}) => {
		await page.goto("/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa"])
			.analyze();

		const seriousOrCritical = results.violations.filter((v) =>
			["serious", "critical"].includes(v.impact ?? ""),
		);
		expect(
			seriousOrCritical,
			JSON.stringify(seriousOrCritical, null, 2),
		).toEqual([]);
	});
});
