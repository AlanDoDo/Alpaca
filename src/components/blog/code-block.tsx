"use client";

import { useRef, useState, type ReactNode } from "react";

export function CodeBlock({ children }: { children?: ReactNode }) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [message, setMessage] = useState("复制代码");
  return <div className="reading-code-block">
    <button type="button" aria-live="polite" onClick={async () => {
      try { await navigator.clipboard.writeText(codeRef.current?.textContent ?? ""); setMessage("已复制"); }
      catch { setMessage("复制失败，请手动选择"); }
    }}>{message}</button>
    <pre ref={codeRef}>{children}</pre>
  </div>;
}
