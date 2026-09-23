#!/usr/bin/env node
/**
 * Generates favicon set from SVG source.
 * Run: node tools/generate-favicon.mjs
 * Requires: sharp
 *
 * ICO packing is local (PNG-in-ICO) so we do not depend on `to-ico`, which
 * pulled an unmaintained jimp@0.2 tree with HIGH/CRITICAL npm advisories.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images");
const SVG_PATH = path.join(__dirname, "favicon-source.svg");

/**
 * Pack PNG buffers into a Windows ICO (PNG-in-ICO, Vista+).
 *
 * @param {{ width: number, height: number, png: Buffer }[]} images
 * @returns {Buffer}
 */
export function pngsToIco(images) {
	if (images.length === 0) {
		throw new Error("pngsToIco requires at least one PNG");
	}

	const headerSize = 6 + 16 * images.length;
	const header = Buffer.alloc(headerSize);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type = ICO
	header.writeUInt16LE(images.length, 4);

	let offset = headerSize;
	const payloads = [];

	for (let i = 0; i < images.length; i += 1) {
		const { width, height, png } = images[i];
		if (!png?.length) {
			throw new Error(`pngsToIco image ${i} is empty`);
		}
		const entry = 6 + 16 * i;
		header.writeUInt8(width >= 256 ? 0 : width, entry);
		header.writeUInt8(height >= 256 ? 0 : height, entry + 1);
		header.writeUInt8(0, entry + 2); // palette size
		header.writeUInt8(0, entry + 3); // reserved
		header.writeUInt16LE(1, entry + 4); // color planes
		header.writeUInt16LE(32, entry + 6); // bits per pixel
		header.writeUInt32LE(png.length, entry + 8);
		header.writeUInt32LE(offset, entry + 12);
		offset += png.length;
		payloads.push(png);
	}

	return Buffer.concat([header, ...payloads]);
}

async function main() {
	fs.mkdirSync(OUT_DIR, { recursive: true });
	const svg = fs.readFileSync(SVG_PATH);

	// favicon.ico (16, 32, 48)
	const png16 = await sharp(svg).resize(16, 16).png().toBuffer();
	const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
	const png48 = await sharp(svg).resize(48, 48).png().toBuffer();
	const ico = pngsToIco([
		{ width: 16, height: 16, png: png16 },
		{ width: 32, height: 32, png: png32 },
		{ width: 48, height: 48, png: png48 },
	]);
	fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), ico);

	// PWA icons
	await sharp(svg)
		.resize(192, 192)
		.png()
		.toFile(path.join(OUT_DIR, "icon-192.png"));
	await sharp(svg)
		.resize(512, 512)
		.png()
		.toFile(path.join(OUT_DIR, "icon-512.png"));

	// Apple touch icon (180x180)
	await sharp(svg)
		.resize(180, 180)
		.png()
		.toFile(path.join(OUT_DIR, "apple-touch-icon.png"));

	console.log("Favicon set generated in public/images/");
}

const isDirectRun =
	Boolean(process.argv[1]) &&
	path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
