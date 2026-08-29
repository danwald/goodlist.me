"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

// AIDEV-NOTE: Shared markdown renderer for item content (dashboard + public list view).
// Security: no rehype-raw / allowedElements escape hatch — react-markdown escapes raw HTML
// found in the markdown source to plain text by default, which is our primary XSS defense
// here since item content is untrusted user input. Do not add rehype-raw.
//
// Layout: list rows are compact single-line-ish elements (`truncate text-sm ...`), so block
// elements like <p>/<ul>/<blockquote> that add vertical margins would blow out the row
// height. We don't restrict which markdown syntax is allowed (headings, lists, etc. still
// parse), we just strip the default browser margins from block-level elements via Tailwind
// utility overrides on the rendered children, keeping everything visually inline/compact.
// No @tailwindcss/typography in package.json, so this is done manually rather than pulling
// in a new dependency.
// AIDEV-NOTE: extracts a hostname for the favicon endpoint only for http(s) links —
// react-markdown's default urlTransform already strips dangerous schemes (javascript:
// etc.), but mailto:/tel:/relative/malformed hrefs are still possible from user-authored
// markdown and `new URL()` throws on those, so this stays defensive.
function faviconHostname(href?: string): string | null {
  if (!href) return null
  try {
    const url = new URL(href)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.hostname
  } catch {
    return null
  }
}

const components: Components = {
  a: ({ children, href, ...props }) => {
    const hostname = faviconHostname(href)
    return (
      <a
        {...props}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1"
      >
        {hostname && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/favicon/${hostname}`}
            alt=""
            width={14}
            height={14}
            className="inline-block shrink-0"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        )}
        {children}
      </a>
    )
  },
  p: ({ children }) => <span className="m-0">{children}</span>,
  ul: ({ children }) => <span className="m-0 inline">{children}</span>,
  ol: ({ children }) => <span className="m-0 inline">{children}</span>,
  li: ({ children }) => <span className="m-0 inline before:content-['_•_']">{children}</span>,
  blockquote: ({ children }) => <span className="m-0 italic">{children}</span>,
  h1: ({ children }) => <span className="m-0 font-bold">{children}</span>,
  h2: ({ children }) => <span className="m-0 font-bold">{children}</span>,
  h3: ({ children }) => <span className="m-0 font-bold">{children}</span>,
  h4: ({ children }) => <span className="m-0 font-bold">{children}</span>,
  h5: ({ children }) => <span className="m-0 font-bold">{children}</span>,
  h6: ({ children }) => <span className="m-0 font-bold">{children}</span>,
  pre: ({ children }) => <span className="m-0 font-mono">{children}</span>,
  code: ({ children }) => (
    <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-zinc-800">
      {children}
    </code>
  ),
}

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <span className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </span>
  )
}
