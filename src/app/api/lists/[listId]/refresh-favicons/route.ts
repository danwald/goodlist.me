import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getFaviconRepository, getListRepository } from "@/infrastructure/db"

type RouteContext = {
  params: Promise<{ listId: string }>
}

const DDG_URL = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`

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

  const domains = [
    ...new Set(
      list.items
        .filter((item) => item.url)
        .map((item) => new URL(item.url!).hostname)
    ),
  ]

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
