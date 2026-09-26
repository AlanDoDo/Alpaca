export type ArticleHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

function plainHeading(source: string): string {
  return source
    .replace(/\s+#+\s*$/, "")
    .replace(/!?(\[([^\]]*)\])\([^)]*\)/g, "$2")
    .replace(/<[^>]*>/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/[~*_]/g, "")
    .replace(/\\([\\`*_{}\[\]()#+.!-])/g, "$1")
    .trim();
}

function headingSlug(title: string, fallback: number): string {
  const normalized = title
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `section-${fallback}`;
}

export function extractArticleHeadings(source: string): ArticleHeading[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const headings: ArticleHeading[] = [];
  const occurrences = new Map<string, number>();
  let fenceMarker: "`" | "~" | null = null;
  let fenceSize = 0;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0] as "`" | "~";
      if (!fenceMarker) {
        fenceMarker = marker;
        fenceSize = fence[1].length;
      } else if (fenceMarker === marker && fence[1].length >= fenceSize) {
        fenceMarker = null;
        fenceSize = 0;
      }
      continue;
    }
    if (fenceMarker) continue;

    const atx = line.match(/^ {0,3}(#{2,3})(?:\s+|$)(.*?)\s*#*\s*$/);
    let level: 2 | 3 | undefined;
    let rawTitle = "";
    if (atx) {
      level = atx[1].length as 2 | 3;
      rawTitle = atx[2];
    } else if (index + 1 < lines.length && /^ {0,3}-{3,}\s*$/.test(lines[index + 1]) && line.trim()) {
      level = 2;
      rawTitle = line.trim();
      index++;
    }
    if (!level) continue;

    const title = plainHeading(rawTitle);
    const base = headingSlug(title, headings.length + 1);
    const occurrence = occurrences.get(base) ?? 0;
    occurrences.set(base, occurrence + 1);
    headings.push({ id: occurrence === 0 ? base : `${base}-${occurrence + 1}`, title: title || `章节 ${headings.length + 1}`, level });
  }

  return headings;
}
