// Generate raster icons from public/icon.svg.
// Apple touch icon (180x180 PNG) referenced by app/layout.tsx and the manifest.
// Run: pnpm gen:icons

import sharp from "sharp";
import { resolve } from "node:path";

const SRC = resolve(process.cwd(), "public", "icon.svg");
const APPLE_OUT = resolve(process.cwd(), "public", "apple-icon.png");

async function main(): Promise<void> {
  await sharp(SRC, { density: 384 })
    .resize(180, 180, { fit: "contain", background: { r: 251, g: 251, b: 250, alpha: 1 } })
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(APPLE_OUT);
  console.log(`wrote ${APPLE_OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
