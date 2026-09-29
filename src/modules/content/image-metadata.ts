import fs from "node:fs";
import path from "node:path";

type Dimensions = { width: number; height: number };
const dimensionsCache = new Map<string, { signature: string; size: Dimensions }>();

/** Read PNG and lossy WebP headers so article images keep their layout space reserved. */
export function getFinanceImageDimensions(content: string): Record<string, Dimensions> {
  const images: Record<string, Dimensions> = {};
  const sources = new Set([...content.matchAll(/!\[[^\]]*\]\((\/images\/finance\/[^)]+\.(?:png|webp))\)/g)].map((match) => match[1]));
  const root = path.resolve(process.cwd(), "public/images/finance");
  for (const src of sources) {
    const file = path.resolve(process.cwd(), "public", `.${src}`);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) continue;
    const stat = fs.statSync(file);
    const signature = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
    const previous = dimensionsCache.get(file);
    if (previous?.signature === signature) { images[src] = previous.size; continue; }
    const buffer = Buffer.alloc(30);
    const handle = fs.openSync(file, "r");
    try { fs.readSync(handle, buffer, 0, 24, 0); }
    finally { fs.closeSync(handle); }
    let size: Dimensions | undefined;
    if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
      size = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    } else if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" && buffer.toString("ascii", 12, 16) === "VP8 ") {
      size = { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (!size) continue;
    if (!size.width || !size.height) continue;
    dimensionsCache.set(file, { signature, size });
    images[src] = size;
  }
  return images;
}
