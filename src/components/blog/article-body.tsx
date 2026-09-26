import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { ArticleHeading } from "@/modules/content/headings";

export function ArticleBody({ source, headings }: { source: string; headings: ArticleHeading[] }) {
  let headingIndex = 0;

  return (
    <div className="article-body prose prose-neutral mt-8 max-w-none break-words prose-headings:font-semibold prose-a:text-[var(--accent)] prose-blockquote:border-l-[var(--accent)] prose-pre:max-w-full prose-pre:overflow-x-auto sm:mt-12">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h2: ({ children }) => <h2 id={headings[headingIndex++]?.id}>{children}</h2>,
          h3: ({ children }) => <h3 id={headings[headingIndex++]?.id}>{children}</h3>,
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
    </div>
  );
}

