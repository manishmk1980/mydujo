import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.resolve(__dirname, "..", "src", "assets", "images");

const targets = [
  {
    source: "mydojo-hero1.png",
    webp: "mydojo-hero1.webp",
    width: 1200,
    webpQuality: 82,
    pngQuality: 86,
  },
];

let updated = 0;

for (const { source, webp, width, webpQuality, pngQuality } of targets) {
  const inputPath = path.join(imagesDir, source);
  const webpPath = path.join(imagesDir, webp);
  const optimizedPngPath = path.join(imagesDir, source);

  if (!fs.existsSync(inputPath)) {
    console.warn(`skip: ${source} not found`);
    continue;
  }

  const inputStat = fs.statSync(inputPath);
  const resized = sharp(inputPath).resize({ width, withoutEnlargement: true });

  await resized.clone().webp({ quality: webpQuality, effort: 4 }).toFile(webpPath);
  await resized.clone().png({ quality: pngQuality, compressionLevel: 9 }).toFile(`${optimizedPngPath}.tmp`);
  fs.renameSync(`${optimizedPngPath}.tmp`, optimizedPngPath);

  const webpStat = fs.statSync(webpPath);
  const pngStat = fs.statSync(optimizedPngPath);
  console.log(
    `optimized ${source}: webp ${Math.round(webpStat.size / 1024)}KB, png ${Math.round(pngStat.size / 1024)}KB (source ${Math.round(inputStat.size / 1024)}KB)`
  );
  updated += 1;
}

if (!updated) {
  console.warn("No images optimized.");
  process.exitCode = 1;
}
