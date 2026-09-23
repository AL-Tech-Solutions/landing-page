import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("cookie policy names the live GA4 measurement cookie", () => {
	it("documents _ga_<measurementId> from the analytics module, not a stale example", () => {
		const analytics = read("src/lib/analytics.ts");
		const cookiePolicy = read("src/app/cookie-policy/page.tsx");

		const measurement = analytics.match(
			/const GA_MEASUREMENT_ID = "(G-[A-Z0-9]+)"/,
		);
		expect(measurement?.[1]).toMatch(/^G-[A-Z0-9]+$/);

		const id = measurement![1];
		expect(cookiePolicy).toContain(`_ga_${id}`);
		expect(cookiePolicy).toContain("_ga</code>");
		expect(cookiePolicy).toContain("_ga_*");

		expect(analytics).toContain(
			"`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`",
		);
		expect(analytics).not.toMatch(/GTM-[A-Z0-9]+/);
	});
});
