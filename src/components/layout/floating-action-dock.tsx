"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { Sparkles, X } from "lucide-react";
import { SearchFloatingButton } from "@/components/layout/search-floating-button";
import { AdminEditorButton } from "@/components/layout/admin-editor-button";
import { MusicWidget } from "@/components/layout/music-widget";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const COLLAPSE_DELAY = 750;

export function FloatingActionDock() {
  const [expanded, setExpanded] = useState(false);
  const musicOpen = useRef(false);
  const closeTimer = useRef<number | null>(null);

  function handlePointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    setExpanded(true);
  }

  function handlePointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => { if (!musicOpen.current) setExpanded(false); }, COLLAPSE_DELAY);
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!musicOpen.current && !event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false);
  }

  useEffect(() => {
    function expandFromContextMenu() {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      setExpanded(true);
    }
    window.addEventListener("techalpaca:expand-dock", expandFromContextMenu);
    return () => window.removeEventListener("techalpaca:expand-dock", expandFromContextMenu);
  }, []);


  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  const handleMusicOpen = useCallback((open: boolean) => {
    musicOpen.current = open;
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    if (open) setExpanded(true);
  }, []);

  return (
    <nav
      aria-label="快捷操作"
      className="floating-dock fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onBlurCapture={handleBlur}
    >
      <button
        type="button"
        className="floating-dock-trigger"
        aria-label={expanded ? "收起快捷操作" : "展开快捷操作"}
        aria-expanded={expanded}
        aria-controls="floating-dock-actions"
        title={expanded ? "收起快捷操作" : "快捷操作 · 右键打开菜单"}
        onClick={() => { window.dispatchEvent(new Event("techalpaca:close-music")); setExpanded((current) => !current); }}
      >
        {expanded ? <X size={19} aria-hidden="true" /> : <Sparkles size={20} aria-hidden="true" />}
        {!expanded && <span className="floating-dock-indicator" aria-hidden="true" />}
      </button>
      <div
        id="floating-dock-actions"
        aria-hidden={!expanded}
        inert={!expanded}
        className={"floating-dock-actions " + (expanded ? "is-open" : "is-closed")}
      >
        <SearchFloatingButton />
        <AdminEditorButton />
        <MusicWidget onOpenChange={handleMusicOpen} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
