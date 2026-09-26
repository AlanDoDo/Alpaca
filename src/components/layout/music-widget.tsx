"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent, type PointerEvent } from "react";
import { Headphones, Music2, X } from "lucide-react";

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
  if (localStorage.getItem(CONFIG_VERSION_KEY) !== CONFIG_VERSION) return DEFAULT_SNAPSHOT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_SNAPSHOT;
  try {
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

export function MusicWidget() {
  const [hovered, setHovered] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [draftId, setDraftId] = useState(DEFAULT_ID);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [playerActivated, setPlayerActivated] = useState(false);
  useEffect(() => {
    if (localStorage.getItem(CONFIG_VERSION_KEY) === CONFIG_VERSION) return;
    localStorage.setItem(STORAGE_KEY, DEFAULT_SNAPSHOT);
    localStorage.setItem(CONFIG_VERSION_KEY, CONFIG_VERSION);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  useEffect(() => {
    function openPlayer() {
      setPlayerActivated(true);
      setHovered(false);
      setManualOpen(true);
    }
    window.addEventListener("techalpaca:open-music", openPlayer);
    return () => window.removeEventListener("techalpaca:open-music", openPlayer);
  }, []);

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const selection = parsePlaylist(JSON.parse(snapshot)) ?? { id: DEFAULT_ID, kind: "playlist" as const };
  const open = hovered || manualOpen;

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") { setPlayerActivated(true); setHovered(true); }
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") setHovered(false);
  }

  function toggleManually() {
    setPlayerActivated(true);
    setHovered(false);
    setManualOpen((current) => !current);
  }

  function closeCard() {
    setHovered(false);
    setManualOpen(false);
  }

  function savePlaylist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = draftId.trim();
    if (!/^\d{1,20}$/.test(id)) {
      setError("请输入网易云歌单链接中的纯数字 ID。");
      return;
    }
    persistSelection({ id, kind: "playlist" });
    setError("");
    setEditing(false);
  }

  const playerUrl = `https://music.163.com/outchain/player?type=0&id=${selection.id}&auto=1&height=90`;

  return (
    <div
      className="music-widget-anchor group relative z-50 self-end"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <section
        aria-label="网易云音乐播放器"
        aria-hidden={!open}
        inert={!open}
        className={`absolute bottom-0 right-[calc(100%+0.75rem)] w-[min(340px,calc(100vw-6rem))] overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_50px_rgba(18,22,28,0.16)] transition-[opacity,transform] duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        } max-h-[min(70dvh,28rem)]`}
      >
        <div className="flex items-start justify-between border-b border-[var(--line)] px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--music-icon-bg)] text-[var(--music-icon-ink)]"><Music2 size={18} aria-hidden="true" /></span>
            <div><p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--muted)]">TECHALPACA RADIO</p><h2 className="mt-0.5 text-sm font-semibold">给阅读配点音乐</h2></div>
          </div>
          <button type="button" onClick={closeCard} aria-label="收起音乐卡片" className="rounded p-1 text-[var(--muted)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"><X size={17} /></button>
        </div>
        <div className="p-3">
          {playerActivated ? <iframe title="网易云音乐顺序播放歌单" src={playerUrl} width="100%" height={110} referrerPolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; clipboard-write" className="block rounded-md border-0" /> : <div className="h-[110px]" />}
          <div className="flex items-center justify-between gap-3 px-1 pt-2 text-xs text-[var(--muted)]">
            <span>歌单 · 按列表顺序播放</span>
            <button type="button" onClick={() => { setDraftId(selection.id); setEditing((current) => !current); setError(""); }} className="shrink-0 hover:text-[var(--ink)]">{editing ? "取消更换" : "更换歌单"}</button>
          </div>
        </div>
        {editing && (
          <form onSubmit={savePlaylist} className="space-y-3 border-t border-[var(--line)] p-4">
            <label className="block text-xs font-medium text-[var(--ink)]" htmlFor="netease-playlist-id">网易云歌单 ID（顺序播放）</label>
            <input id="netease-playlist-id" aria-label="网易云歌单 ID" inputMode="numeric" pattern="[0-9]+" value={draftId} onChange={(event) => { setDraftId(event.target.value); setError(""); }} placeholder="粘贴网易云歌单链接中的 ID" className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]" />
            {error && <p role="alert" className="text-xs text-[var(--danger)]">{error}</p>}
            <div className="flex items-center justify-between gap-3"><a href="https://music.163.com/" target="_blank" rel="noreferrer" className="text-xs text-[var(--muted)] underline underline-offset-4 hover:text-[var(--ink)]">打开网易云音乐找歌单</a><button type="submit" className="rounded-md bg-[var(--ink)] px-3 py-2 text-xs font-medium text-[var(--accent-contrast)] transition hover:opacity-80">保存歌单</button></div>
            <p className="text-[11px] leading-5 text-[var(--muted)]">页面会尝试自动播放；如果浏览器拦截声音，请点击播放器中的播放按钮。</p>
          </form>
        )}
      </section>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "收起音乐卡片" : "打开音乐卡片"}
        onClick={toggleManually}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#17191c] text-white shadow-lg transition duration-200 hover:w-[4.5rem] hover:bg-[#25282c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] group-hover:w-[4.5rem]"
      >
        <Headphones size={18} aria-hidden="true" />
        <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-12 group-hover:opacity-100">音乐</span>
        <span className="absolute left-[2.15rem] top-0.5 h-2 w-2 rounded-full border border-[#17191c] bg-[#65c18c]" aria-label="已连接" />
      </button>
    </div>
  );
}







