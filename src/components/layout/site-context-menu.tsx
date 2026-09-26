"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  Copy,
  Folder,
  Headphones,
  Moon,
  PenLine,
  RotateCw,
  Search,
  Shuffle,
  Sun,
} from "lucide-react";

type MenuData = { categories: string[]; randomSlug: string | null };
type MenuPosition = { x: number; y: number };
type Submenu = "categories" | null;

const EMPTY_DATA: MenuData = { categories: [], randomSlug: null };

export function SiteContextMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [submenu, setSubmenu] = useState<Submenu>(null);
  const [data, setData] = useState<MenuData>(EMPTY_DATA);
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);

  function closeMenu() {
    setPosition(null);
    setSubmenu(null);
    setCopied(false);
  }

  useEffect(() => {
    function onContextMenu(event: MouseEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable='true'], iframe")) return;
      event.preventDefault();
      setPosition({ x: event.clientX, y: event.clientY });
      setSubmenu(null);
      setIsDark(document.documentElement.dataset.theme === "dark");
      fetch("/api/context-menu", { cache: "no-store" })
        .then((response) => response.ok ? response.json() as Promise<MenuData> : EMPTY_DATA)
        .then(setData)
        .catch(() => setData(EMPTY_DATA));
    }

    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) closeMenu();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (submenu) setSubmenu(null);
      else closeMenu();
    }

    function onScroll() {
      closeMenu();
    }

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [submenu]);

  useLayoutEffect(() => {
    if (!position || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), Math.max(min, max));
    let x = clamp(position.x, 10, window.innerWidth - rect.width - 10);
    let y = clamp(position.y, 10, window.innerHeight - rect.height - 10);
    const trigger = document.querySelector<HTMLElement>(".floating-dock-trigger");
    const dock = trigger?.getBoundingClientRect();
    if (dock && x < dock.right && x + rect.width > dock.left && y < dock.bottom && y + rect.height > dock.top) {
      const above = dock.top - rect.height - 10;
      if (above >= 10) y = above;
      else x = dock.left - rect.width - 10;
      x = clamp(x, 10, window.innerWidth - rect.width - 10);
      y = clamp(y, 10, window.innerHeight - rect.height - 10);
    }
    if (x !== position.x || y !== position.y) setPosition({ x, y });
  }, [position, submenu]);

  if (!position) return null;

  function openSearch(query?: string) {
    window.dispatchEvent(new Event("techalpaca:expand-dock"));
    window.dispatchEvent(new CustomEvent("techalpaca:open-search", { detail: { query } }));
    closeMenu();
  }

  function openMusic() {
    window.dispatchEvent(new Event("techalpaca:expand-dock"));
    window.dispatchEvent(new Event("techalpaca:open-music"));
    closeMenu();
  }

  function toggleTheme() {
    window.dispatchEvent(new Event("techalpaca:toggle-theme"));
    setIsDark((current) => !current);
    closeMenu();
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(closeMenu, 850);
    } catch {
      setCopied(false);
    }
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/");
    closeMenu();
  }

  const itemClass = "context-menu-item";

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="页面快捷菜单"
      className="site-context-menu"
      style={{ left: position.x, top: position.y }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="context-menu-toolbar">
        <button type="button" role="menuitem" aria-label="后退" title="后退" onClick={goBack}><ArrowLeft size={18} /></button>
        <button type="button" role="menuitem" aria-label="前进" title="前进" onClick={() => { window.history.forward(); closeMenu(); }}><ArrowRight size={18} /></button>
        <button type="button" role="menuitem" aria-label="刷新页面" title="刷新页面" onClick={() => window.location.reload()}><RotateCw size={18} /></button>
        <button type="button" role="menuitem" aria-label="回到顶部" title="回到顶部" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); closeMenu(); }}><ArrowUp size={18} /></button>
      </div>

      <button type="button" role="menuitem" className={itemClass} onClick={() => { if (data.randomSlug) router.push("/article/" + data.randomSlug); closeMenu(); }}>
        <Shuffle size={17} /><span>随机文章</span><ChevronRight size={15} className="context-menu-trailing" />
      </button>

      <button type="button" role="menuitem" aria-expanded={submenu === "categories"} className={itemClass} onClick={() => setSubmenu(submenu === "categories" ? null : "categories")}>
        <Folder size={17} /><span>博客分类</span><ChevronRight size={15} className={"context-menu-trailing " + (submenu === "categories" ? "is-expanded" : "")} />
      </button>
      {submenu === "categories" && (
        <div className="context-menu-sublist" role="group" aria-label="博客分类">
          <Link role="menuitem" href="/blog" onClick={closeMenu}>全部文章</Link>
          {data.categories.map((category) => <Link role="menuitem" key={category} href={"/blog?category=" + encodeURIComponent(category)} onClick={closeMenu}>{category}</Link>)}
        </div>
      )}

      <div className="context-menu-divider" />
      <button type="button" role="menuitem" className={itemClass} onClick={copyAddress}>
        {copied ? <Check size={17} /> : <Copy size={17} />}<span>{copied ? "已复制地址" : "复制地址"}</span>
      </button>
      <button type="button" role="menuitem" className={itemClass} onClick={toggleTheme}>
        {isDark ? <Sun size={17} /> : <Moon size={17} />}<span>{isDark ? "白昼模式" : "暗夜模式"}</span>
      </button>

      <div className="context-menu-divider" />
      <button type="button" role="menuitem" className={itemClass} onClick={() => openSearch()}><Search size={17} /><span>搜索文章</span><kbd>⌘ K</kbd></button>
      <Link role="menuitem" className={itemClass} href="/admin/articles" onClick={closeMenu}><PenLine size={17} /><span>写文章</span><ChevronRight size={15} className="context-menu-trailing" /></Link>
      <button type="button" role="menuitem" className={itemClass} onClick={openMusic}><Headphones size={17} /><span>音乐播放器</span></button>
    </div>
  );
}
