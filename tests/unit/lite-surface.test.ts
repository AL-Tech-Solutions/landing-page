import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");

function read(rel: string) {
	return readFileSync(path.join(ROOT, rel), "utf8");
}

describe("Lite Mode actually drops expensive chrome", () => {
	it("skips GlassCard blur when reduceEffects is on", () => {
		const card = read("src/components/ui/GlassCard.tsx");

		expect(card).toContain("useReduceEffects");
		expect(card).toContain("const { reduceEffects } = useReduceEffects()");
		expect(card).toMatch(
			/reduceEffects\s*\?\s*"bg-background"\s*:\s*"bg-surface backdrop-blur-\[20px\]"/,
		);
		expect(card).toContain("isSolid");
	});

	it("skips navbar and hero availability blur, and the hero pulse, in Lite Mode", () => {
		const navbar = read("src/components/layout/Navbar.tsx");
		expect(navbar).toContain("useReduceEffects");
		expect(navbar).toMatch(
			/reduceEffects \? "bg-background" : "bg-surface backdrop-blur-\[20px\]"/,
		);

		const hero = read("src/components/hero/HeroSection.tsx");
		expect(hero).toContain("useReduceEffects");
		expect(hero).toMatch(
			/reduceEffects\s*\?\s*"bg-background"\s*:\s*"bg-surface backdrop-blur-\[20px\]"/,
		);
		expect(hero).toMatch(/reduceEffects \? "" : "animate-pulse"/);
	});
});
