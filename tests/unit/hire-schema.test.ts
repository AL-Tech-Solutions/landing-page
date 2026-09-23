import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hire } from "@/data/hire";

const ROOT = path.resolve(__dirname, "../..");
const HIRE_DIR = path.join(ROOT, "src/components/hire");
const HIRE_PAGE = path.join(ROOT, "src/app/hire/page.tsx");

const ACQUISITION_MARKUP =
	/application\/ld\+json|OfferCatalog|ProfessionalService|schema\.org/i;

function hireSources(): string[] {
	const files = readdirSync(HIRE_DIR)
		.filter((name) => /\.(ts|tsx)$/.test(name))
		.map((name) => path.join(HIRE_DIR, name));
	return [HIRE_PAGE, ...files];
}

describe("/hire stays off acquisition schema", () => {
	it("does not embed JSON-LD or OfferCatalog on the hire route", () => {
		const sources = hireSources();
		expect(sources.length).toBeGreaterThan(1);

		for (const file of sources) {
			const source = readFileSync(file, "utf8");
			expect(source, file).not.toMatch(ACQUISITION_MARKUP);
		}

		expect(JSON.stringify(hire)).not.toMatch(
			/OfferCatalog|ProfessionalService|application\/ld\+json/i,
		);
	});
});
