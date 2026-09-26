import fs from "node:fs";
import path from "node:path";

type Dimensions = { width: number; height: number };
const dimensionsCache = new Map<string, { signature: string; size: Dimensions }>();

/** Read only PNG headers, keeping the full-resolution original on disk. */
export function getFinanceImageDimensions(content: string): Record<string, Dimensions> {
  const images: Record<string, Dimensions> = {};
  const sources = new Set([...content.matchAll(/!\[[^\]]*\]\((\/images\/finance\/[^)]+\.png)\)/g)].map((match) => match[1]));
  const root = path.resolve(process.cwd(), "public/images/finance");
  for (const src of sources) {
    const file = path.resolve(process.cwd(), "public", `.${src}`);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) continue;
    const stat = fs.statSync(file);
    const signature = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
    const previous = dimensionsCache.get(file);
    if (previous?.signature === signature) { images[src] = previous.size; continue; }
    const buffer = Buffer.alloc(24);
    const handle = fs.openSync(file, "r");
    try { fs.readSync(handle, buffer, 0, 24, 0); }
    finally { fs.closeSync(handle); }
    if (!buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) continue;
    const size = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    if (!size.width || !size.height) continue;
    dimensionsCache.set(file, { signature, size });
    images[src] = size;
  }
  return images;
}
