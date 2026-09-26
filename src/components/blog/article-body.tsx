import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { ReadingImages } from "./reading-images";
import type { ArticleHeading } from "@/modules/content/headings";

export function ArticleBody({ source, headings, images = {} }: { source: string; headings: ArticleHeading[]; images?: Record<string, { width: number; height: number }> }) {
  let headingIndex = 0;

  return (
    <div className="article-body prose prose-neutral mt-8 max-w-none break-words prose-headings:font-semibold prose-a:text-[var(--accent)] prose-blockquote:border-l-[var(--accent)] prose-pre:max-w-full prose-pre:overflow-x-auto sm:mt-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          table: ({ children }) => <div className="reading-table-scroll" tabIndex={0} role="region" aria-label="文章表格，可横向滚动"><table>{children}</table></div>,
          h2: ({ children }) => <h2 id={headings[headingIndex++]?.id}>{children}</h2>,
          h3: ({ children }) => <h3 id={headings[headingIndex++]?.id}>{children}</h3>,
          img: ({ alt, src, ...props }) => {
            const size = typeof src === "string" ? images[src] : undefined;
            if (size && typeof src === "string") return <Image src={src} alt={alt ?? ""} width={size.width} height={size.height} sizes="(min-width: 1024px) 850px, 100vw" loading="lazy" />;
            // Other Markdown images may use arbitrary hosts without intrinsic dimensions.
            // eslint-disable-next-line @next/next/no-img-element
            return <img alt={alt ?? ""} src={src} decoding="async" loading="lazy" {...props} />;
          },
          a: ({ href, children, ...props }) => {
            if (href?.startsWith("/") && !href.startsWith("//")) {
              return <Link href={href} {...props}>{children}</Link>;
            }
            return <a href={href} {...props}>{children}</a>;
          },
        }}
      >
        {source}
      </ReactMarkdown>
      <ReadingImages source={source} />
    </div>
  );
}

