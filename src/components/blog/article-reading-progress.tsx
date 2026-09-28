"use client";

import { useEffect } from "react";

export function ArticleReadingProgress() {
  useEffect(() => {
    const article = document.querySelector<HTMLElement>("[data-reading-content]");
    if (!article) return;

    let frame = 0;
    const updateProgress = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const articleTop = article.getBoundingClientRect().top + window.scrollY;
        const scrollableHeight = Math.max(article.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(1, Math.max(0, (window.scrollY - articleTop) / scrollableHeight));
        document.documentElement.style.setProperty("--article-reading-progress", String(progress));
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty("--article-reading-progress");
    };
  }, []);

  return <div className="article-reading-progress" aria-hidden="true"><span /></div>;
}
