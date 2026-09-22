import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { hire, HIRE_CONTACT_DISCLAIMER } from "../../src/data/hire";

async function openHire(page: Page) {
	await page.goto("/hire/");
	await page.evaluate(() => localStorage.setItem("cookie-consent", "rejected"));
	await page.reload();
}

test.describe("hire conversion page", () => {
	test("renders the v1.1 section order on desktop and mobile", async ({
		page,
	}) => {
		await openHire(page);

		await expect(page.locator("nav")).toBeVisible();
		await expect(page.locator("footer")).toBeVisible();

		await expect(page.getByText(hire.availability)).toBeVisible();
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			hire.headline,
		);
		await expect(page.getByText(hire.offer)).toBeVisible();
		await expect(page.getByText(hire.trustLine)).toBeVisible();

		const headings = await page.locator("main h1, main h2").allTextContents();
		expect(headings.map((text) => text.trim())).toEqual([
			hire.headline,
			hire.audienceHeading,
			hire.packagesHeading,
			hire.proofHeading,
			hire.engageHeading,
			hire.faqHeading,
			hire.contactHeading,
		]);

		const heroTalk = page.getByRole("link", { name: hire.ctaPrimary }).first();
		await expect(heroTalk).toBeVisible();
		await expect(heroTalk).toHaveAttribute("href", "#contact");

		const seeResume = page.getByRole("link", { name: hire.ctaSecondary });
		await expect(seeResume).toBeVisible();
		await expect(seeResume).toHaveAttribute("href", /\/$/);

		for (const item of hire.audience) {
			await expect(page.getByText(item.line)).toBeVisible();
		}

		for (const pkg of hire.packages) {
			const card = page
				.getByRole("heading", { level: 3, name: pkg.title })
				.locator("..");
			await expect(card.getByText(pkg.pain)).toBeVisible();
			await expect(card.getByText(pkg.deliverables)).toBeVisible();
			await expect(card.getByText(pkg.bestFor)).toBeVisible();
			if (pkg.footnote) {
				await expect(card.getByText(pkg.footnote)).toBeVisible();
			}
			if (pkg.credentials) {
				await expect(card.getByText(pkg.credentials)).toBeVisible();
			}
			const body = await card.innerText();
			const painAt = body.indexOf(pkg.pain);
			const bestAt = body.indexOf(pkg.bestFor);
			const deliverablesAt = body.indexOf(pkg.deliverables);
			expect(painAt).toBeGreaterThanOrEqual(0);
			expect(bestAt).toBeGreaterThan(painAt);
			expect(deliverablesAt).toBeGreaterThan(bestAt);
			const trailing = pkg.footnote ?? pkg.credentials;
			if (trailing) {
				expect(body.indexOf(trailing)).toBeGreaterThan(deliverablesAt);
			}
			const pkgTalk = card.getByRole("link", { name: pkg.ctaLabel });
			await expect(pkgTalk).toHaveAttribute("href", "#contact");
			await expect(pkgTalk).not.toHaveClass(/bg-accent/);
			await expect(pkgTalk).toHaveClass(/border-border/);
		}

		const contactPrimary = page
			.locator("#contact")
			.getByRole("link", { name: hire.contactCtaLabel });
		await expect(contactPrimary).toHaveClass(/bg-accent/);

		for (const teaser of hire.proofTeasers) {
			await expect(page.getByText(teaser.line)).toBeVisible();
		}
		const viewLinks = page.getByRole("link", { name: "View on resume" });
		await expect(viewLinks).toHaveCount(hire.proofTeasers.length);
		await expect(viewLinks.first()).toHaveAttribute("href", /\/#experience/);
		await expect(
			page
				.getByRole("heading", { level: 2, name: hire.proofHeading })
				.locator("xpath=following-sibling::*[1]"),
		).toHaveClass(/md:grid-cols-3/);

		const certBadges = page.getByRole("list", { name: "Certifications" });
		for (const badge of hire.badges) {
			await expect(
				certBadges.getByRole("link", { name: badge.label }),
			).toBeVisible();
		}

		for (const [index, step] of hire.engageSteps.entries()) {
			const heading = page.getByRole("heading", { level: 3, name: step.title });
			await expect(heading).toBeVisible();
			await expect(page.getByText(step.detail)).toBeVisible();
			const stepNumber = heading.locator("xpath=preceding-sibling::p[1]");
			await expect(stepNumber).toHaveText(String(index + 1));
			await expect(stepNumber).toHaveAttribute("aria-hidden", "true");
		}

		for (const item of hire.faqs) {
			await expect(
				page.getByRole("heading", { level: 3, name: item.question }),
			).toBeVisible();
			await expect(page.getByText(item.answer)).toBeHidden();
		}
		const firstFaq = page.locator("details").filter({
			has: page.getByRole("heading", { level: 3, name: hire.faqs[0].question }),
		});
		const firstSummary = firstFaq.locator("summary");
		await expect(firstSummary).toHaveCSS("display", "block");
		await firstSummary.click();
		await expect(page.getByText(hire.faqs[0].answer)).toBeVisible();
		await expect(page.getByText(hire.faqs[1].answer)).toBeHidden();

		const contact = page.locator("#contact");
		await expect(
			contact.getByRole("heading", { level: 2, name: hire.contactHeading }),
		).toBeVisible();
		await expect(contact.getByText(HIRE_CONTACT_DISCLAIMER)).toBeVisible();
		await expect(
			contact.getByRole("link", { name: hire.contactDisclaimerLink }),
		).toHaveAttribute("href", /\/privacy-policy\/?/);
		await expect(
			contact.getByRole("link", { name: hire.contactCtaLabel }),
		).toHaveAttribute("href", /^mailto:/);

		await heroTalk.click();
		await expect(
			contact.getByRole("heading", { level: 2, name: hire.contactHeading }),
		).toBeVisible();
	});

	test("omits Hire from primary nav and footer while the page stays live", async ({
		page,
	}) => {
		await openHire(page);

		const nav = page.locator("nav");
		const menuButton = page.getByRole("button", { name: /Open menu/i });
		if (await menuButton.isVisible()) {
			await menuButton.click();
		}

		await expect(nav.getByRole("link", { name: "About" })).toBeVisible();
		await expect(nav.getByRole("link", { name: "Experience" })).toBeVisible();
		await expect(nav.getByRole("link", { name: "Resume" })).toBeVisible();
		await expect(nav.getByRole("link", { name: "Contact" })).toBeVisible();
		await expect(nav.getByRole("link", { name: "Hire" })).toHaveCount(0);
		await expect(nav.getByRole("link", { name: "Work" })).toHaveCount(0);
		await expect(nav.getByRole("link", { name: "Proof" })).toHaveCount(0);
		await expect(nav.getByRole("link", { name: "Privacy" })).toHaveCount(0);
		await expect(
			page.locator("footer").getByRole("link", { name: "Hire" }),
		).toHaveCount(0);
		await expect(page).toHaveURL(/\/hire\/?/);
	});

	test("does not feature the diploma org or Academic/labs blurb", async ({
		page,
	}) => {
		await openHire(page);

		await expect(page.getByText("devops-skill-demonstration")).toHaveCount(0);
		await expect(
			page.getByText(
				"Diploma project (KhAI): GCP/GKE platform lab with layered Terraform (init → in-cluster ops → config) and observability — skills demonstration, not a client engagement.",
			),
		).toHaveCount(0);
		await expect(
			page.getByRole("heading", { name: "GCP/GKE platform lab" }),
		).toHaveCount(0);
		await expect(
			page.getByRole("link", { name: /0-documentation/ }),
		).toHaveCount(0);
	});

	test("keeps three proof teasers on one row from md up", async ({
		page,
	}, testInfo) => {
		test.skip(
			!testInfo.project.name.includes("desktop"),
			"One-row proof grid is asserted on desktop",
		);

		await openHire(page);

		const boxes = [];
		for (const teaser of hire.proofTeasers) {
			const box = await page.getByText(teaser.line).boundingBox();
			expect(box).toBeTruthy();
			boxes.push(box!);
		}
		const top = Math.min(...boxes.map((box) => box.y));
		const bottom = Math.max(...boxes.map((box) => box.y));
		expect(bottom - top).toBeLessThan(24);
		expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x);
		expect(boxes[2]!.x).toBeGreaterThan(boxes[1]!.x);
	});

	test("keeps three Who it’s for cards on one row from md up", async ({
		page,
	}, testInfo) => {
		test.skip(
			!testInfo.project.name.includes("desktop"),
			"One-row audience grid is asserted on desktop",
		);

		await openHire(page);

		const boxes = [];
		for (const item of hire.audience) {
			const box = await page.getByText(item.line).boundingBox();
			expect(box).toBeTruthy();
			boxes.push(box!);
		}
		const top = Math.min(...boxes.map((box) => box.y));
		const bottom = Math.max(...boxes.map((box) => box.y));
		expect(bottom - top).toBeLessThan(48);
		expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x);
		expect(boxes[2]!.x).toBeGreaterThan(boxes[1]!.x);
	});

	test("keeps How we engage as a three-step strip from md up", async ({
		page,
	}, testInfo) => {
		test.skip(
			!testInfo.project.name.includes("desktop"),
			"One-row engage strip is asserted on desktop",
		);

		await openHire(page);

		const boxes = [];
		for (const step of hire.engageSteps) {
			const box = await page
				.getByRole("heading", { level: 3, name: step.title })
				.boundingBox();
			expect(box).toBeTruthy();
			boxes.push(box!);
		}
		const top = Math.min(...boxes.map((box) => box.y));
		const bottom = Math.max(...boxes.map((box) => box.y));
		expect(bottom - top).toBeLessThan(24);
		expect(boxes[1]!.x).toBeGreaterThan(boxes[0]!.x);
		expect(boxes[2]!.x).toBeGreaterThan(boxes[1]!.x);
	});

	test("stacks package cards and uses full-width primary CTAs on mobile", async ({
		page,
	}, testInfo) => {
		test.skip(
			!testInfo.project.name.includes("mobile"),
			"Mobile stacking is asserted on the Pixel project",
		);

		await openHire(page);

		const titles = hire.packages.map((pkg) =>
			page.getByRole("heading", { level: 3, name: pkg.title }),
		);
		const boxes = [];
		for (const title of titles) {
			const box = await title.boundingBox();
			expect(box).toBeTruthy();
			boxes.push(box!);
		}
		expect(boxes[1]!.y).toBeGreaterThan(boxes[0]!.y + boxes[0]!.height - 1);
		expect(boxes[2]!.y).toBeGreaterThan(boxes[1]!.y + boxes[1]!.height - 1);

		const heroTalk = page.getByRole("link", { name: hire.ctaPrimary }).first();
		const talkBox = await heroTalk.boundingBox();
		const viewport = page.viewportSize();
		expect(talkBox).toBeTruthy();
		expect(viewport).toBeTruthy();
		expect(talkBox!.width).toBeGreaterThan(viewport!.width * 0.7);
	});

	test("stacks How we engage steps on mobile", async ({ page }, testInfo) => {
		test.skip(
			!testInfo.project.name.includes("mobile"),
			"Engage stacking is asserted on the Pixel project",
		);

		await openHire(page);

		const titles = hire.engageSteps.map((step) =>
			page.getByRole("heading", { level: 3, name: step.title }),
		);
		const boxes = [];
		for (const title of titles) {
			const box = await title.boundingBox();
			expect(box).toBeTruthy();
			boxes.push(box!);
		}
		expect(boxes[1]!.y).toBeGreaterThan(boxes[0]!.y + boxes[0]!.height - 1);
		expect(boxes[2]!.y).toBeGreaterThan(boxes[1]!.y + boxes[1]!.height - 1);
	});

	test("document title and OG/Twitter follow hire meta, not the locked H1", async ({
		page,
	}) => {
		await openHire(page);

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);
		await expect(page).toHaveTitle(
			"Hire DevOps (AWS & Kubernetes) | Q2 2027 | Andrii Lytvynenko",
		);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute(
			"content",
			"B2B DevOps from the EU — cloud cost & reliability, IaC/Kubernetes, CI/CD & observability. Case-study outcomes, not guarantees. Proof on the resume.",
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			"content",
			"Hire DevOps (AWS & Kubernetes) | Q2 2027 | Andrii Lytvynenko",
		);
		await expect(
			page.locator('meta[property="og:description"]'),
		).toHaveAttribute(
			"content",
			"B2B DevOps from the EU — cloud cost & reliability, IaC/Kubernetes, CI/CD & observability. Case-study outcomes, not guarantees. Proof on the resume.",
		);
		await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
			"content",
			"Hire DevOps (AWS & Kubernetes) | Q2 2027 | Andrii Lytvynenko",
		);
		await expect(
			page.locator('meta[name="twitter:description"]'),
		).toHaveAttribute(
			"content",
			"B2B DevOps from the EU — cloud cost & reliability, IaC/Kubernetes, CI/CD & observability. Case-study outcomes, not guarantees. Proof on the resume.",
		);
	});

	test("JSON-LD keeps Person cleanup and strips acquisition schema", async ({
		page,
	}) => {
		await openHire(page);

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Hire DevOps that cuts cloud cost and keeps systems up.",
		);

		const graphs = (
			await page.locator('script[type="application/ld+json"]').allTextContents()
		).map((text) => JSON.parse(text) as Record<string, unknown>);
		const blob = JSON.stringify(graphs);

		expect(blob).not.toMatch(/"worksFor"/);
		expect(blob).not.toMatch(/"seeks"/);
		expect(blob).not.toMatch(/JobPosting/);
		expect(blob).not.toMatch(/Geniusee/);
		expect(blob).not.toMatch(/@gmail\.com/);
		expect(blob).not.toMatch(/OfferCatalog/);
		expect(blob).not.toMatch(/ProfessionalService/);

		const types = graphs.map((graph) => graph["@type"]);
		expect(types).toEqual(["Person"]);

		const person = graphs.find((graph) => graph["@type"] === "Person");
		expect(person).toMatchObject({
			name: "Andrii Lytvynenko",
			jobTitle: "Senior DevOps & Cloud Engineer",
			url: "https://alytvynenko.net/",
		});
		expect(person).not.toHaveProperty("email");
		expect(person).not.toHaveProperty("worksFor");
		expect(person).not.toHaveProperty("seeks");
	});

	test("has no serious or critical axe violations", async ({ page }) => {
		await openHire(page);

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
