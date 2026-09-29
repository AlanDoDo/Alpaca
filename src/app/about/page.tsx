import Image from "next/image";
import { InkArt } from "@/components/visual/ink-art";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
  description: "认识 TechAlpaca：记录技术、阅读、项目实践和个人思考。",
};

const bookCategories = [
  {
    name: "金融",
    description: "偏重投资框架、周期认知和资产配置。",
    books: [
      ["《聪明的投资者》", "本杰明·格雷厄姆", "价值投资经典，强调安全边际、理性分析与长期持有，被奉为普通投资者的“圣经”。"],
      ["《穷查理宝典》", "彼得·考夫曼", "收录查理·芒格的投资智慧、人生哲学与多元思维模型，教你用理性、跨学科的方式思考财富与人生。"],
      ["《交易心理分析》", "马克·道格拉斯", "聚焦交易中的心态与概率思维，帮助摆脱情绪干扰，建立稳定、可持续的交易行为模式。"],
      ["《日本蜡烛图分析》", "史蒂夫·尼森", "系统讲解 K 线形态与信号，是技术分析中判断价格趋势与反转的基础工具书。"],
    ],
  },
  {
    name: "做事方法论",
    description: "教你理性思考、高效成事的底层框架。",
    books: [
      ["《认知天性》", "彼得·布朗", "解决一个问题：教你如何成为学新东西最快的那个人。"],
      ["《精要主义》", "格雷戈·麦吉沃恩", "如何提高工作效率，在工作中做得更少，但效果更好。"],
      ["《12个工作的基本》", "大久保幸夫", "整理并练习 12 种工作能力，帮助建立职场竞争力。"],
      ["《深度工作》", "卡尔·纽波特", "学习如何专注工作，让大脑更高效地解决问题。"],
      ["《刻意练习》", "安德斯·艾利克森", "一套适用于不同领域的学习方法论。"],
    ],
  },
  {
    name: "个人成长与思维提升",
    description: "向内认知升级，向外高效成事。",
    books: [
      ["《金字塔原理》", "巴巴拉·明托", "学习高效思考、表达和解决问题的逻辑。"],
      ["《横向领导力》", "罗杰·费希尔", "理解如何通过协作发挥领导力，在职场中与他人更好地合作。"],
      ["《自控力》", "凯利·麦格尼格尔", "理解注意力、自我意识与行为习惯。"],
      ["《第3选择》", "史蒂芬·柯维", "学习解决难题的关键思维。"],
    ],
  },
  {
    name: "情商提升",
    description: "读懂情绪，会说话，会处事，也更懂得与人相处。",
    books: [
      ["《非暴力沟通》", "马歇尔·卢森堡", "学习高情商沟通，减少沟通中的误解与冲突。"],
      ["《第一印象心理学》", "安·德玛瑞斯", "理解如何给人留下好印象。"],
      ["《优势谈判》", "罗杰·道森", "认识谈判要诀，为自己争取合理的利益。"],
      ["《亲密关系》", "罗兰·米勒", "通过对亲密关系的研究，理解如何建立长久关系。"],
      ["《关键对话》", "科里·帕特森", "学习工作与生活中的对话技巧，维护良好的沟通氛围。"],
    ],
  },
  {
    name: "古籍思考",
    description: "探究天地规律、命理运势与人生智慧的传统经典。",
    books: [
      ["《周易》", "非一人一时之作", "讲述变化规律、阴阳平衡与决策智慧，启发人生选择。"],
      ["《改命纪实录》", "道之光", "以故事探讨风水命理与修心之道。"],
      ["《滴天髓》", "非一人一时之作", "命理入门与进阶读物，也探讨顺势而为与修心。"],
      ["《奇门遁甲》", "非一人一时之作", "融易经、兵法与时空格局于一体，探讨判断局势与把握时机。"],
    ],
  },
] as const;

export default function AboutPage() {
  return (
    <div className="site-shell about-page py-12 sm:py-16 md:py-24">
      <InkArt variant="wash" className="about-side-ink about-side-ink-left" />
      <InkArt variant="wash" className="about-side-ink about-side-ink-right" />
      <header className="ink-page-heading ink-heading-about"><InkArt />
      <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">ABOUT / TECHALPACA</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:mt-5 sm:text-4xl md:text-5xl">关于我</h1>
      </header>
      <section className="about-intro relative mt-8 grid gap-6 border-b border-[var(--line)] pb-10 sm:mt-10 sm:min-h-[26rem] sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center sm:gap-8 sm:pb-28 lg:min-h-[34rem] lg:gap-12 lg:pb-36">
        <Image
          src="/images/techalpaca-avatar.webp"
          alt="TechAlpaca 的头像：戴着蓝色科技风眼镜的白色羊驼"
          width={480}
          height={480}
          sizes="(max-width: 639px) 144px, 192px"
          priority
          className="aspect-square w-36 rounded-2xl object-cover sm:w-48"
        />
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--muted)]">TECHALPACA</p>
          <p className="mt-4 text-sm font-medium leading-7 text-[var(--muted)]">AI🚀 + 机器人🤖 + 金融💴</p>
          <h2 className="mt-3 text-2xl font-semibold">研究技术如何改变产业，也研究钱最终流向哪里👣</h2>
          <p className="mt-5 leading-8 text-[var(--muted)]">我是 <strong className="font-medium text-[var(--ink)]">TechAlpaca</strong>，关注 AI 与机器人行业，擅长利用 AI 解决重复工作流，也在寻找合适的工作机会。我会在这里整理文章与随笔、项目和一些阶段性的思考。</p>
          <p className="mt-3 leading-8 text-[var(--muted)]">AI+机器人行业，保持好奇，独立思考，长期主义🤔</p>
          <p className="mt-2 leading-8 text-[var(--muted)]">想看见更大的世界，先认识更多的人💪</p>
        </div>
        <figure className="about-calligraphy">
          <Image
            src="/images/ink/about-calligraphy.webp"
            alt="所有的伟大，源自一次勇敢的开始。"
            width={2130}
            height={281}
            sizes="(max-width: 639px) calc(100vw - 2rem), 432px"
            className="about-calligraphy-image"
          />
          <svg className="about-calligraphy-stroke" viewBox="0 0 420 24" fill="none" aria-hidden="true">
            <defs>
              <filter id="about-ink-edge" x="-2%" y="-60%" width="104%" height="220%">
                <feTurbulence type="fractalNoise" baseFrequency="0.08 0.55" numOctaves="2" seed="7" result="grain" />
                <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <path className="about-brush-body" d="M4 15.5C18 13.7 34 9.1 57 9.2C83 9.3 109 13.1 137 12.1C169 10.9 196 7.6 224 8.3C252 9 279 13.4 307 12.3C347 10.7 379 4.5 416 4.1C408 7.9 398 9.5 385 11.8C354 17.2 330 17.6 301 15.6C269 13.4 242 12.7 214 14.6C181 16.8 156 19 127 17.5C94 15.9 72 14.7 49 17.7C30 20.1 15 18.9 4 15.5Z" filter="url(#about-ink-edge)" />
            <path className="about-brush-fiber" d="M19 14.1C57 10.1 82 12.6 116 14.1C154 15.7 176 11.8 211 11.3C242 10.9 267 14.9 298 14.8C337 14.7 366 9.5 400 6.4" />
            <path className="about-brush-fiber" d="M41 17.3C77 14.7 103 16.5 132 16.6M157 17.4C181 17.9 197 15.1 219 14.9M260 15.4C281 16.2 300 17.1 322 15.5" />
            <path className="about-brush-fiber" d="M74 10.2C95 10.8 108 12.4 126 12.7M232 9.3C248 9.7 261 11.8 275 12.1M343 11.1C356 9.9 367 7.9 378 7.2" />
          </svg>
        </figure>
      </section>

      <section data-ink-reveal aria-labelledby="about-explore-title" className="border-b border-[var(--line)] py-8 sm:py-12">
        <h2 id="about-explore-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">继续探索</h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">以机器人为工作主线，也关注智能的演进与市场的变化。这里记录我的学习、实践，以及尚在形成的判断。</p>
        <nav aria-label="更多研究领域" className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
          {[
            { href: "/ai", label: "AI 研究", eyebrow: "ARTIFICIAL INTELLIGENCE", description: "从模型原理到工具实践，探索 AI 如何走进真实工作。" },
            { href: "/finance", label: "金融笔记", eyebrow: "FINANCE", description: "梳理交易与投资的思考，在波动中建立自己的判断。" },
          ].map((area) => (
            <Link key={area.href} href={area.href} className="ink-link-card group rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[var(--muted)] sm:text-xs">{area.eyebrow}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-[var(--ink)]">{area.label}</h3>
                <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)]" />
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{area.description}</p>
            </Link>
          ))}
        </nav>
      </section>

      <section data-ink-reveal className="ink-section pt-12">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--muted)]">BOOKSHELF</p>
        <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">图书推荐</h2>
        <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">先分享两本会反复翻阅的书，更多书单按主题收在下面。</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {bookCategories[0].books.slice(0, 2).map(([title, author, note]) => (
            <li key={title} className="rounded-2xl border border-[var(--line)] p-5 sm:p-6">
              <p className="text-xs text-[var(--muted)]">金融 · 精选</p>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{author}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{note}</p>
            </li>
          ))}
        </ul>
        <details className="group/books mt-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)] [&::-webkit-details-marker]:hidden">
            <span><span className="group-open/books:hidden">展开全部书单</span><span className="hidden group-open/books:inline">收起更多书单</span><span className="ml-2 text-[var(--muted)]">其余 {bookCategories.reduce((count, category) => count + category.books.length, 0) - 2} 本</span></span>
            <span aria-hidden="true" className="text-xl text-[var(--muted)] group-open/books:rotate-45">+</span>
          </summary>
          <div className="mt-4">
          {bookCategories.map((category, categoryIndex) => (
            <details key={category.name} className="group border-t border-[var(--line)] py-5 last:border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <span><span className="text-lg font-medium">{category.name}</span><span className="ml-3 text-sm text-[var(--muted)]">{category.books.length - (categoryIndex === 0 ? 2 : 0)} 本{categoryIndex === 0 ? " · 更多" : ""}</span></span>
                <span aria-hidden="true" className="text-xl text-[var(--muted)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{category.description}</p>
              <ul className="mt-5 divide-y divide-[var(--line)]">
                {category.books.slice(categoryIndex === 0 ? 2 : 0).map(([title, author, note]) => (
                  <li key={title} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 text-xs text-[var(--muted)]">{author}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{note}</p>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          </div>
        </details>
      </section>
    </div>
  );
}






