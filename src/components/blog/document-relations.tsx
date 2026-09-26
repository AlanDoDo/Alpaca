import Link from "next/link";
import { documentRelations } from "@/modules/content/connected";
export function DocumentRelations({ href }: { href: string }) {
  const { outgoing, incoming, unresolved } = documentRelations(href);
  if (!outgoing.length && !incoming.length && !unresolved.length) return null;
  return <section aria-label="文章关联" className="document-relations">
    {outgoing.length > 0 && <details><summary>本文引用 <span>{outgoing.length}</span></summary><ul>{outgoing.map((item) => <li key={item.id}><Link href={item.href}>{item.title}</Link></li>)}</ul></details>}
    {incoming.length > 0 && <details><summary>引用本文 <span>{incoming.length}</span></summary><ul>{incoming.map((item) => <li key={item.id}><Link href={item.href}>{item.title}</Link></li>)}</ul></details>}
    {unresolved.length > 0 && <details><summary>待整理引用 <span>{unresolved.length}</span></summary><ul>{unresolved.map((item) => <li key={item}>{item}</li>)}</ul></details>}
  </section>;
}
