"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const storageKey = "techalpaca-theme";

export function ThemeToggle() {
  useEffect(() => {
    try {
      document.documentElement.dataset.theme = window.localStorage.getItem(storageKey) === "dark" ? "dark" : "light";
    } catch { /* Retain the theme initialized before first paint. */ }
  }, []);

  useEffect(() => {
    function toggleFromMenu() {
      const root = document.documentElement;
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      try { window.localStorage.setItem(storageKey, nextTheme); } catch { /* Theme still works for this visit. */ }
    }
    window.addEventListener("techalpaca:toggle-theme", toggleFromMenu);
    return () => window.removeEventListener("techalpaca:toggle-theme", toggleFromMenu);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try { window.localStorage.setItem(storageKey, nextTheme); } catch { /* Theme still works for this visit. */ }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="切换白昼/暗夜主题"
      title="切换白昼/暗夜主题"
      className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--accent)] shadow-md shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <Moon className="theme-toggle-moon" size={16} aria-hidden="true" />
      <Sun className="theme-toggle-sun" size={17} aria-hidden="true" />
    </button>
  );
}

