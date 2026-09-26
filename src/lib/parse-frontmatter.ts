import matter from "gray-matter";

/** Articles are data: never execute gray-matter's JavaScript frontmatter engine. */
export function parseFrontmatter(source: string) {
  const opening = source.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0];
  if (opening.startsWith("---") && !/^---(?:yaml|yml|json)?\s*$/.test(opening)) {
    throw new Error("Only YAML or JSON article frontmatter is supported");
  }
  return matter(source, {
    engines: {
      javascript: () => { throw new Error("Executable frontmatter is disabled"); },
      js: () => { throw new Error("Executable frontmatter is disabled"); },
    },
  });
}
