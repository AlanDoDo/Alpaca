import Link from "next/link";
import { InkArt } from "@/components/visual/ink-art";
import type { Metadata } from "next";
import { ArrowDown, ArrowLeft, ArrowUpRight, BookOpen, Plus } from "lucide-react";
import { getFinanceNotes, type FinanceNote } from "@/modules/content/finance";

export const metadata: Metadata = {
  title: "金融 · 投机与投资",
  description: "关于交易纪律、资产配置和长期价值的个人研究笔记。",
  alternates: { canonical: "/finance" },
};

function NoteLink({ note, index }: { note: FinanceNote; index: number }) {
  return <Link href={`/finance/${note.slug}`} className="finance-note-link"><span className="finance-note-number">{String(index + 1).padStart(2, "0")}</span><div><p>{note.topic} <span>· {note.readingTime} 分钟阅读</span></p><h3>{note.title}</h3><small>{note.description}</small></div><ArrowUpRight size={18} aria-hidden="true" /></Link>;
}

function NotebookSection({ notes, section, id, subtitle, quote }: { notes: FinanceNote[]; section: string; id: string; subtitle: string; quote: string }) {
  const lead = notes[0];
  if (!lead) return null;
  const remaining = notes.slice(1);
  return <section data-ink-reveal className={`finance-field finance-field-${id}`} id={id}>
    <header className="finance-field-heading"><div><p className="finance-eyebrow">{id === "speculation" ? "01 / SPECULATION" : "02 / INVESTMENT"}</p><h2>{section}<span>{notes.length} 篇笔记</span></h2><p className="finance-field-description">{subtitle}</p></div><span className="finance-field-symbol" aria-hidden="true">{id === "speculation" ? "↗" : "∞"}</span></header>
    <Link href={`/finance/${lead.slug}`} className="finance-feature"><span className="finance-feature-top"><span>从这里开始</span><BookOpen size={18} aria-hidden="true" /></span><p className="finance-feature-quote">{quote}</p><h3>{lead.title}</h3><p className="finance-feature-description">{lead.description}</p><span className="finance-feature-bottom"><span>{lead.readingTime} 分钟阅读</span><span>打开笔记 <ArrowUpRight size={18} aria-hidden="true" /></span></span></Link>
    <div className="finance-note-list">{remaining.slice(0, 3).map((note, index) => <NoteLink key={note.slug} note={note} index={index} />)}</div>
    {remaining.length > 3 && <details className="finance-more-notes"><summary>其余 {remaining.length - 3} 篇研究笔记 <Plus size={16} aria-hidden="true" /></summary><div>{remaining.slice(3).map((note, index) => <NoteLink key={note.slug} note={note} index={index + 3} />)}</div></details>}
    {id === "speculation" && <div className="finance-method"><p className="finance-eyebrow">我的执行顺序</p><p>结构 <span>→</span> 风险 <span>→</span> 时间 <span>→</span> 价格</p><small>耐心等待关键位置，记录每一次判断与执行。</small></div>}
  </section>;
}

export default function FinancePage() {
  const notes = getFinanceNotes();
  return <div className="finance-page mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16">
    <Link className="finance-back" href="/about"><ArrowLeft size={15} aria-hidden="true" />关于我</Link>
    <header className="finance-hero">
      <div className="finance-hero-copy"><p className="finance-eyebrow">TECHALPACA / FINANCIAL NOTEBOOK</p><h1>面对波动，<br />也面对时间。</h1><p className="finance-hero-description">投机研究价格与执行，投资研究资产与价值。<br className="hidden sm:block" />把每一次思考留下来，让判断经得起回看。</p><nav aria-label="金融板块" className="finance-section-nav"><a href="#speculation">投机 <ArrowDown size={15} aria-hidden="true" /></a><a href="#investment">投资 <ArrowDown size={15} aria-hidden="true" /></a><span>{notes.length} 篇个人笔记</span></nav></div>
      <div className="finance-hero-art" aria-hidden="true"><InkArt variant="fragment" /><span className="finance-art-label">PRICE / TIME / VALUE</span><svg viewBox="0 0 480 230" fill="none"><path className="finance-art-grid" d="M0 55H480M0 115H480M0 175H480M80 0V230M200 0V230M320 0V230M440 0V230" /><path className="finance-art-price" d="M0 188L35 165L68 182L95 125L128 150L156 93L183 122L213 64L239 96L265 48L290 75L318 112L343 82L370 103L397 51L429 64L480 18" /><path className="finance-art-value" d="M0 208C125 202 175 195 255 159C335 123 372 110 480 30" /><circle cx="255" cy="159" r="5" /></svg><span className="finance-art-caption">记录变化，也积累认知</span></div>
    </header>
    <div className="finance-fields">
      <NotebookSection notes={notes.filter((note) => note.section === "投机")} section="投机" id="speculation" subtitle="关注结构、动能与交易纪律。把计划写在入场之前，把复盘留在离场之后。" quote="先理解风险，再寻找机会。" />
      <NotebookSection notes={notes.filter((note) => note.section === "投资")} section="投资" id="investment" subtitle="从资金分配到公司研究，连接产业、现金流与估值，持续积累长期判断。" quote="理解资产，让时间参与。" />
    </div>
    <footer className="finance-editorial-note"><p>这是我的金融学习与研究笔记，记录观点形成的过程。</p><p>文中的配置、标的和市场判断保留原笔记语境，不代表当前建议；数据与假设仍需持续验证。</p></footer>
  </div>;
}
