import { getFaviconRepository } from "@/infrastructure/db"

type RouteContext = {
  params: Promise<{ domain: string }>
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const DDG_URL = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`

// AIDEV-NOTE: public route — no auth. Serves favicon bytes from DB cache, fetches from DuckDuckGo on miss/expiry.
export async function GET(_req: Request, context: RouteContext) {
  const { domain } = await context.params
  const faviconRepo = getFaviconRepository()

  const cached = await faviconRepo.findByDomain(domain)
  const isStale = !cached || cached.fetchedAt.getTime() < Date.now() - SEVEN_DAYS_MS

  if (!isStale && cached) {
    return new Response(cached.data, {
      headers: {
        "Content-Type": "image/x-icon",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    })
  }

  try {
    const res = await fetch(DDG_URL(domain), { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error(`DDG returned ${res.status}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    await faviconRepo.upsert(domain, buffer)
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/x-icon",
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
      },
    })
  } catch {
    // Serve stale data rather than a broken image if we have it
    if (cached) {
      return new Response(cached.data, {
        headers: { "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=3600" },
      })
    }
    return new Response(null, { status: 404 })
  }
}
