"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: content stays visible without JavaScript. */
export function InkMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-ink-reveal]"));
    const artworks = Array.from(document.querySelectorAll<HTMLElement>("[data-ink-art]"));
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.inkVisible = "true";
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    const artObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        (entry.target as HTMLElement).dataset.inkRunning = String(entry.isIntersecting);
      });
    });
    const syncMotion = () => {
      revealObserver.disconnect();
      reveals.forEach((element) => {
        // Never hide content already visible, including after browser back navigation.
        if (media.matches || element.getBoundingClientRect().top < window.innerHeight || element.contains(document.activeElement)) {
          element.dataset.inkVisible = "true";
        } else {
          element.dataset.inkVisible = "false";
          revealObserver.observe(element);
        }
      });
    };
    const syncVisibility = () => {
      document.documentElement.dataset.inkPaused = String(document.hidden);
    };
    artworks.forEach((element) => artObserver.observe(element));
    syncMotion();
    syncVisibility();
    media.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      revealObserver.disconnect();
      artObserver.disconnect();
      media.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
      reveals.forEach((element) => delete element.dataset.inkVisible);
      artworks.forEach((element) => delete element.dataset.inkRunning);
      delete document.documentElement.dataset.inkPaused;
    };
  }, [pathname]);
  return null;
}
