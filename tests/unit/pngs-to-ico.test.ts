import { statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../..");
const FAVICON = path.join(ROOT, "public", "images", "favicon.ico");

type PngsToIco = (
	images: {
		width: number;
		height: number;
		png: Buffer;
	}[],
) => Buffer;

async function loadPngsToIco(): Promise<PngsToIco> {
	const mod = (await import("../../tools/generate-favicon.mjs")) as {
		pngsToIco: PngsToIco;
	};
	return mod.pngsToIco;
}

describe("pngsToIco", () => {
	it("does not rewrite public/images when imported from tests", async () => {
		const before = statSync(FAVICON).mtimeMs;
		await loadPngsToIco();
		expect(statSync(FAVICON).mtimeMs).toBe(before);
	});

	it("packs a PNG-in-ICO header and payload", async () => {
		const pngsToIco = await loadPngsToIco();
		const png16 = Buffer.from("ONE");
		const png32 = Buffer.from("TWO!");
		const ico = pngsToIco([
			{ width: 16, height: 16, png: png16 },
			{ width: 32, height: 32, png: png32 },
		]);

		expect(ico.readUInt16LE(0)).toBe(0);
		expect(ico.readUInt16LE(2)).toBe(1);
		expect(ico.readUInt16LE(4)).toBe(2);

		expect(ico.readUInt8(6)).toBe(16);
		expect(ico.readUInt8(7)).toBe(16);
		expect(ico.readUInt16LE(10)).toBe(1);
		expect(ico.readUInt16LE(12)).toBe(32);
		expect(ico.readUInt32LE(14)).toBe(png16.length);
		const firstOffset = ico.readUInt32LE(18);
		expect(firstOffset).toBe(6 + 16 * 2);

		expect(ico.readUInt8(22)).toBe(32);
		expect(ico.readUInt32LE(30)).toBe(png32.length);
		expect(ico.readUInt32LE(34)).toBe(firstOffset + png16.length);

		expect(ico.subarray(firstOffset, firstOffset + png16.length)).toEqual(
			png16,
		);
		expect(
			ico.subarray(
				firstOffset + png16.length,
				firstOffset + png16.length + png32.length,
			),
		).toEqual(png32);
	});

	it("encodes 256px as 0 and rejects empty input", async () => {
		const pngsToIco = await loadPngsToIco();
		const png = Buffer.from("PNG");
		const ico = pngsToIco([{ width: 256, height: 256, png }]);
		expect(ico.readUInt8(6)).toBe(0);
		expect(ico.readUInt8(7)).toBe(0);

		expect(() => pngsToIco([])).toThrow(/at least one PNG/);
		expect(() =>
			pngsToIco([{ width: 16, height: 16, png: Buffer.alloc(0) }]),
		).toThrow(/empty/);
	});
});
