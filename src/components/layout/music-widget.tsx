"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Disc3, Settings2, X } from "lucide-react";

type MusicSelection = { id: string; kind: "playlist" };
const STORAGE_KEY = "techalpaca:netease-music";
const CONFIG_VERSION_KEY = "techalpaca:netease-music-config-version";
const CONFIG_VERSION = "sequential-playlist-7231928049-v1";
const CHANGE_EVENT = "techalpaca:netease-music-change";
const DEFAULT_ID = "7231928049";
const DEFAULT_SNAPSHOT = JSON.stringify({ id: DEFAULT_ID, kind: "playlist" });

function parsePlaylist(value: unknown): MusicSelection | null {
  if (!value || typeof value !== "object") return null;
  const selection = value as Partial<MusicSelection>;
  return typeof selection.id === "string" && /^\d{1,20}$/.test(selection.id) && selection.kind === "playlist"
    ? { id: selection.id, kind: "playlist" }
    : null;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    if (localStorage.getItem(CONFIG_VERSION_KEY) !== CONFIG_VERSION) return DEFAULT_SNAPSHOT;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SNAPSHOT;
    return JSON.stringify(parsePlaylist(JSON.parse(stored)) ?? { id: DEFAULT_ID, kind: "playlist" });
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

function getServerSnapshot() {
  return DEFAULT_SNAPSHOT;
}

function persistSelection(selection: MusicSelection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  localStorage.setItem(CONFIG_VERSION_KEY, CONFIG_VERSION);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function MusicWidget({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPointer = useRef({ x: 0, y: 0 });
  const latestState = useRef({ open: false, editing: false, onOpenChange });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftId, setDraftId] = useState(DEFAULT_ID);
  const [error, setError] = useState("");
  const [playerReady, setPlayerReady] = useState(false);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const selection = parsePlaylist(JSON.parse(snapshot)) ?? { id: DEFAULT_ID, kind: "playlist" as const };

  const pointerIsOverWidget = useCallback(() => {
    const { x, y } = lastPointer.current;
    const inside = (element: HTMLElement | null) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };
    return inside(triggerRef.current) || (latestState.current.open && inside(panelRef.current));
  }, []);

  const scheduleClose = useCallback(() => {
    if (latestState.current.editing || closeTimer.current !== undefined) return;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = undefined;
      if (latestState.current.editing || pointerIsOverWidget()) return;
      setOpen(false);
      latestState.current.open = false;
      latestState.current.onOpenChange(false);
    }, 350);
  }, [pointerIsOverWidget]);

  useEffect(() => {
    latestState.current.open = open;
    latestState.current.editing = editing;
    latestState.current.onOpenChange = onOpenChange;
  }, [open, editing, onOpenChange]);

  function expand(value: boolean) {
    if (closeTimer.current !== undefined) clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    if (!value) {
      latestState.current.editing = false;
      setEditing(false);
    }
    if (value) setPlayerReady(true);
    latestState.current.open = value;
    setOpen(value);
    onOpenChange(value);
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function schedule() { timer = setTimeout(() => setPlayerReady(true), 1500); }
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => { if (timer) clearTimeout(timer); window.removeEventListener("load", schedule); };
  }, []);

  useEffect(() => {
    function trackPointer(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse") return;
      lastPointer.current = { x: event.clientX, y: event.clientY };
      if (!latestState.current.open || latestState.current.editing) return;
      if (pointerIsOverWidget()) {
        if (closeTimer.current !== undefined) clearTimeout(closeTimer.current);
        closeTimer.current = undefined;
      } else {
        scheduleClose();
      }
    }
    document.addEventListener("pointermove", trackPointer, true);
    return () => document.removeEventListener("pointermove", trackPointer, true);
  }, [pointerIsOverWidget, scheduleClose]);

  useEffect(() => {
    function show() { if (closeTimer.current !== undefined) clearTimeout(closeTimer.current); closeTimer.current = undefined; setPlayerReady(true); latestState.current.open = true; setOpen(true); onOpenChange(true); }
    function hide() { if (closeTimer.current !== undefined) clearTimeout(closeTimer.current); closeTimer.current = undefined; latestState.current.open = false; latestState.current.editing = false; setEditing(false); setOpen(false); onOpenChange(false); }
    function dismiss(event: globalThis.PointerEvent) { if (!anchorRef.current?.contains(event.target as Node)) hide(); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape" && anchorRef.current?.contains(document.activeElement)) { hide(); triggerRef.current?.focus(); } }
    window.addEventListener("techalpaca:open-music", show);
    window.addEventListener("techalpaca:close-music", hide);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      if (closeTimer.current !== undefined) clearTimeout(closeTimer.current);
      window.removeEventListener("techalpaca:open-music", show);
      window.removeEventListener("techalpaca:close-music", hide);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [onOpenChange]);

  function savePlaylist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[0-9]{1,20}$/.test(draftId.trim())) { setError("请输入纯数字歌单 ID。"); return; }
    try { persistSelection({ id: draftId.trim(), kind: "playlist" }); }
    catch { setError("无法保存歌单，请允许本地存储后重试。"); return; }
    latestState.current.editing = false;
    setEditing(false);
    setError("");
  }

  return (
    <div ref={anchorRef} className="music-widget-anchor relative z-50 self-end"
      onPointerEnter={(event) => { if (event.pointerType === "mouse") expand(true); }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        lastPointer.current = { x: event.clientX, y: event.clientY };
        scheduleClose();
      }}>
      <section ref={panelRef} id="music-player-panel" aria-label="网易云音乐播放器" aria-hidden={!open} inert={!open} className={`music-embed-panel ${open ? "is-open" : "is-closed"}`}>
        <div className="music-embed-body">
          {playerReady ? <iframe title="网易云音乐歌单播放器" src={`https://music.163.com/outchain/player?type=0&id=${selection.id}&auto=1&height=90`} width="100%" height={110} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" className="block w-full border-0" /> : <div className="flex h-[110px] items-center justify-center text-xs text-[var(--muted)]">正在准备音乐…</div>}
        </div>
        <div className="music-embed-footer">
          <span className="music-embed-caption">NETEASE · RADIO</span>
          <div className="flex items-center gap-1">
            <button type="button" className="music-embed-action" aria-label="更换歌单" title="更换歌单" onClick={() => { setDraftId(selection.id); setError(""); setEditing((value) => { latestState.current.editing = !value; return !value; }); }}><Settings2 size={15} /></button>
            <button type="button" className="music-embed-action" aria-label="收起播放器" onClick={() => { expand(false); triggerRef.current?.focus(); }}><X size={16} /></button>
          </div>
        </div>
        {editing && <form onSubmit={savePlaylist} className="border-t border-[var(--line)] bg-[var(--surface)] p-3 text-[var(--ink)]">
          <label htmlFor="netease-playlist-id" className="mb-2 block text-xs text-[var(--muted)]">网易云歌单 ID</label>
          <div className="flex gap-2"><input id="netease-playlist-id" inputMode="numeric" maxLength={20} value={draftId} onChange={(event) => setDraftId(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]" /><button type="submit" className="rounded-lg bg-[var(--ink)] px-3 text-xs text-[var(--accent-contrast)]">保存</button></div>
          {error && <p role="alert" className="mt-2 text-xs text-[var(--danger)]">{error}</p>}
        </form>}
      </section>
      <button ref={triggerRef} type="button" className="music-capsule" aria-label={open ? "收起网易云播放器" : "打开网易云播放器"} aria-expanded={open} aria-controls="music-player-panel" onClick={() => expand(!open)}>
        <span className="music-capsule-record" aria-hidden="true"><Disc3 size={25} strokeWidth={1.2} /></span>
        <span className="music-capsule-copy"><span>阅读电台</span></span>
      </button>
    </div>
  );
}
