import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const faviconPath = join(root, "app", "favicon.ico");
const publicDir = join(root, "public");

const sizes = [
	{ name: "apple-touch-icon.png", size: 180 },
	{ name: "icon-192.png", size: 192 },
	{ name: "icon-512.png", size: 512 },
];

async function generate() {
	const buffer = readFileSync(faviconPath);
	for (const { name, size } of sizes) {
		await sharp(buffer)
			.resize(size, size, {
				fit: "contain",
				background: { r: 255, g: 255, b: 255, alpha: 0 },
			})
			.png()
			.toFile(join(publicDir, name));
		console.log(`✓ ${name} (${size}×${size})`);
	}
	console.log("Done!");
}

generate().catch(console.error);
