import { test, expect, type Page } from "@playwright/test";

const GTM_SCRIPT = 'script[src*="googletagmanager.com/gtag/js"]';
const CONSENT_DIALOG = { name: "Cookie settings" } as const;
const LAWYER_BODY =
	"I use cookies to analyze site traffic via Google Analytics. You can accept or reject analytics cookies. Essential site preferences stay available either way. See the Cookie Policy and Privacy Policy.";

async function blockAnalytics(page: Page) {
	await page.route("https://www.googletagmanager.com/**", (route) =>
		route.fulfill({ status: 204, body: "" }),
	);
	await page.route("https://www.google-analytics.com/**", (route) =>
		route.fulfill({ status: 204, body: "" }),
	);
}

test.describe("consent-first analytics", () => {
	test("first visit shows the banner and does not inject GA", async ({
		page,
	}) => {
		await blockAnalytics(page);
		await page.goto("/");

		const dialog = page.getByRole("dialog", CONSENT_DIALOG);
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText(LAWYER_BODY);
		await expect(
			dialog.getByRole("link", { name: "Cookie Policy" }),
		).toHaveAttribute("href", "/cookie-policy/");
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
		await expect(
			page.locator('link[rel="preconnect"][href*="googletagmanager"]'),
		).toHaveCount(0);
		await expect(
			page.locator('link[rel="dns-prefetch"][href*="google-analytics"]'),
		).toHaveCount(0);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBeNull();
	});

	test("reject persists, hides the banner, and never injects GA", async ({
		page,
	}) => {
		await blockAnalytics(page);
		await page.goto("/");

		await page
			.getByRole("button", { name: "Reject analytics cookies" })
			.click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBe("rejected");
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);

		await page.reload();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
	});

	test("accept persists and injects the GA script tag", async ({ page }) => {
		await blockAnalytics(page);
		await page.goto("/");

		await page
			.getByRole("button", { name: "Accept analytics cookies" })
			.click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBe("accepted");
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(1);
		await expect(page.locator("script#google-analytics")).toHaveCount(1);

		await page.reload();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(1);
	});

	test("footer Cookie settings reopens the same consent gate without setting a choice", async ({
		page,
	}) => {
		await blockAnalytics(page);
		await page.goto("/");

		await page
			.getByRole("button", { name: "Reject analytics cookies" })
			.click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);

		await page.getByRole("button", { name: "Cookie settings" }).click();
		const dialog = page.getByRole("dialog", CONSENT_DIALOG);
		await expect(dialog).toBeVisible();
		await expect(dialog).toContainText(LAWYER_BODY);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBeNull();
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
	});

	test("reopen from footer: Accept loads GA and Reject unloads it", async ({
		page,
	}) => {
		await blockAnalytics(page);
		await page.goto("/");

		await page
			.getByRole("button", { name: "Accept analytics cookies" })
			.click();
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(1);
		await expect(page.locator("script#google-analytics")).toHaveCount(1);

		await page.getByRole("button", { name: "Cookie settings" }).click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toBeVisible();
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
		await expect(page.locator("script#google-analytics")).toHaveCount(0);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBeNull();

		await page
			.getByRole("button", { name: "Accept analytics cookies" })
			.click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(1);
		await expect(page.locator("script#google-analytics")).toHaveCount(1);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBe("accepted");

		await page.getByRole("button", { name: "Cookie settings" }).click();
		await page
			.getByRole("button", { name: "Reject analytics cookies" })
			.click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toHaveCount(0);
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
		await expect(page.locator("script#google-analytics")).toHaveCount(0);
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBe("rejected");
	});

	test("home still renders when localStorage access is denied", async ({
		page,
	}) => {
		await blockAnalytics(page);
		await page.addInitScript(() => {
			const denied = new DOMException(
				"Failed to read the 'localStorage' property from 'Window': Access is denied for this document.",
				"SecurityError",
			);
			Object.defineProperty(window, "localStorage", {
				configurable: true,
				get() {
					throw denied;
				},
			});
		});

		await page.goto("/");

		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await expect(page.getByRole("navigation")).toBeVisible();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toBeVisible();
		await expect(page.locator(GTM_SCRIPT)).toHaveCount(0);
	});

	test("Cookie settings is on the shared footer including /hire", async ({
		page,
	}) => {
		await blockAnalytics(page);
		await page.goto("/hire/");
		await page.evaluate(() =>
			localStorage.setItem("cookie-consent", "rejected"),
		);
		await page.reload();

		await expect(
			page.getByRole("button", { name: "Cookie settings" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Cookie settings" }).click();
		await expect(page.getByRole("dialog", CONSENT_DIALOG)).toBeVisible();
		expect(
			await page.evaluate(() => localStorage.getItem("cookie-consent")),
		).toBeNull();
	});
});
