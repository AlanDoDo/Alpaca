"use client";

import { useEffect, useState } from "react";
import type { ArticleHeading } from "@/modules/content/headings";

export function ArticleTableOfContents({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const idsKey = headings.map(({ id }) => id).join("|");

  useEffect(() => {
    const headingIds = idsKey.split("|").filter(Boolean);
    const elements = headingIds.map((id) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveId(visible.target.id);
    }, { rootMargin: "-12% 0px -72% 0px", threshold: 0 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [idsKey]);

  return (
    <div className="article-toc-desktop sticky top-8" aria-label="文章目录">
      <p className="article-toc-label">ON THIS PAGE</p>
      <nav aria-label="文章目录">
        <ol className="article-toc-list">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? "location" : undefined}
                className={`article-toc-link ${heading.level === 3 ? "article-toc-subitem" : ""} ${activeId === heading.id ? "is-active" : ""}`}
              >
                {heading.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

