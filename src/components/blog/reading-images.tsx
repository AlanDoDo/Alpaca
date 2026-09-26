"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ReadingImages({ source }: { source: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  useEffect(() => {
    const root = marker.current?.closest(".article-body");
    if (!root) return;
    const images = Array.from(root.querySelectorAll("img"));
    function open(event: Event) {
      const target = event.currentTarget as HTMLImageElement;
      if (target.closest("a")) return;
      if (event instanceof KeyboardEvent && !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      setImage({ src: target.currentSrc || target.src, alt: target.alt });
    }
    const previous = images.map((img) => ({ img, tab: img.getAttribute("tabindex"), role: img.getAttribute("role") }));
    images.filter((img) => !img.closest("a")).forEach((img) => {
      img.tabIndex = 0; img.setAttribute("role", "button"); img.setAttribute("aria-label", `${img.alt || "文章图片"}，点击放大`);
      img.addEventListener("click", open); img.addEventListener("keydown", open);
    });
    return () => previous.forEach(({ img, tab, role }) => {
      img.removeEventListener("click", open); img.removeEventListener("keydown", open); img.removeAttribute("aria-label");
      if (tab === null) img.removeAttribute("tabindex"); else img.setAttribute("tabindex", tab);
      if (role === null) img.removeAttribute("role"); else img.setAttribute("role", role);
    });
  }, [source]);
  useEffect(() => {
    if (!image) return;
    const active = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; active?.focus(); };
  }, [image]);
  return <><span ref={marker} hidden />{image && createPortal(
    <dialog ref={dialog} className="reading-image-dialog" aria-label="图片放大预览" onCancel={() => setImage(null)} onClick={(event) => { if (event.target === event.currentTarget) setImage(null); }}>
      <button type="button" onClick={() => setImage(null)} autoFocus aria-label="关闭图片">关闭 ×</button>
      {/* Reuse the already loaded image URL, including optimized Next.js URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} />
      {image.alt && <p>{image.alt}</p>}
    </dialog>, document.body)}</>;
}
