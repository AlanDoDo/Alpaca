import fs from "node:fs";
import path from "node:path";

/** Reuse parsed files while checking metadata on every access for edits and deletions. */
export function createFileCollection<T>(directory: string, parse: (fileName: string) => T) {
  let entries = new Map<string, { signature: string; value: T }>();
  let snapshot: T[] = [];
  return () => {
    const names = fs.existsSync(directory) ? fs.readdirSync(directory).filter((name) => /\.mdx?$/.test(name)).sort() : [];
    const next = new Map<string, { signature: string; value: T }>();
    let changed = names.length !== entries.size;
    for (const name of names) {
      const stat = fs.statSync(path.join(directory, name));
      const signature = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
      const previous = entries.get(name);
      if (previous?.signature === signature) next.set(name, previous);
      else {
        next.set(name, { signature, value: parse(name) });
        changed = true;
      }
    }
    if (changed) snapshot = [...next.values()].map(({ value }) => value);
    entries = next;
    return snapshot;
  };
}
