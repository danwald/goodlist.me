import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFaviconRepository, getItemRepository, getListRepository } from "@/infrastructure/db"

type RouteContext = {
  params: Promise<{ listId: string }>
}

const DDG_URL = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`

// AIDEV-NOTE: item content is markdown source (see MarkdownContent) — both bracket-syntax
// links and bare autolinked URLs embed the literal URL substring in the raw text, so a
// regex scan is sufficient here without a full markdown parse. This is just a cache-warming
// optimization (GET /api/favicon/[domain] already fetches+caches lazily on miss), so
// approximate extraction is fine.
const URL_PATTERN = /https?:\/\/[^\s)"'<>]+/g

function extractHostnames(content: string): string[] {
  const matches = content.match(URL_PATTERN) ?? []
  return matches.flatMap((raw) => {
    try {
      return [new URL(raw).hostname]
    } catch {
      return []
    }
  })
}

// AIDEV-NOTE: authenticated — only list owner can trigger a bulk favicon refresh
export async function POST(_req: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { listId } = await context.params
  const listRepo = getListRepository()
  const list = await listRepo.findById(listId)

  if (!list || list.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // AIDEV-NOTE: this bulk job needs every item in the list (not just one page),
  // so it uses the unbounded findAllByList — findById no longer eagerly includes items.
  const itemRepo = getItemRepository()
  const items = await itemRepo.findAllByList(listId)

  const domains = [...new Set(items.flatMap((item) => extractHostnames(item.content)))]

  const faviconRepo = getFaviconRepository()
  let refreshed = 0

  for (const domain of domains) {
    try {
      const res = await fetch(DDG_URL(domain), { signal: AbortSignal.timeout(3000) })
      if (!res.ok) continue
      const arrayBuffer = await res.arrayBuffer()
      await faviconRepo.upsert(domain, new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>)
      refreshed++
    } catch {
      // skip unreachable domains
    }
  }

  return NextResponse.json({ refreshed, total: domains.length })
}
