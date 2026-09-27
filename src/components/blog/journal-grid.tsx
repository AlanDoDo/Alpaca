"use client";

import { useSyncExternalStore, type ComponentProps } from "react";
import { JournalCard } from "./journal-card";

function columnCount() {
  return window.matchMedia("(min-width: 1024px)").matches ? 3 : window.matchMedia("(min-width: 640px)").matches ? 2 : 1;
}
function subscribe(callback: () => void) {
  const queries = [window.matchMedia("(min-width: 640px)"), window.matchMedia("(min-width: 1024px)")];
  queries.forEach((query) => query.addEventListener("change", callback));
  return () => queries.forEach((query) => query.removeEventListener("change", callback));
}
const serverColumns = () => 3;

/** Separate columns keep hover expansion from rebalancing the entire gallery. */
export function JournalGrid({ items }: { items: ComponentProps<typeof JournalCard>[] }) {
  const columns = useSyncExternalStore(subscribe, columnCount, serverColumns);
  return <div className="journal-masonry">{Array.from({ length: columns }, (_, column) =>
    <div className="journal-column" key={column}>{items.map((item, index) => index % columns === column ?
      <div className="journal-slot" style={{ order: index }} key={item.article.slug}><JournalCard {...item} /></div> : null)}</div>
  )}</div>;
}
