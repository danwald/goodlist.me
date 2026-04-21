import { getFaviconRepository } from "@/infrastructure/db"

type RouteContext = {
  params: Promise<{ domain: string }>
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const DDG_URL = (domain: string) => `https://icons.duckduckgo.com/ip3/${domain}.ico`

const iconHeaders = (maxAge: number) => ({
  "Content-Type": "image/x-icon",
  "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=86400`,
})

// AIDEV-NOTE: public route — no auth. Serves favicon bytes from DB cache, fetches from DuckDuckGo on miss/expiry.
export async function GET(_req: Request, context: RouteContext) {
  const { domain } = await context.params
  const faviconRepo = getFaviconRepository()

  const cached = await faviconRepo.findByDomain(domain)
  const isStale = !cached || cached.fetchedAt.getTime() < Date.now() - SEVEN_DAYS_MS

  if (!isStale && cached) {
    return new Response(cached.data.buffer as ArrayBuffer, { headers: iconHeaders(604800) })
  }

  try {
    const arrayBuffer = await fetch(DDG_URL(domain), {
      signal: AbortSignal.timeout(3000),
    }).then((r) => {
      if (!r.ok) throw new Error(`DDG returned ${r.status}`)
      return r.arrayBuffer()
    })

    await faviconRepo.upsert(domain, new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>)
    return new Response(arrayBuffer, { headers: iconHeaders(604800) })
  } catch {
    // Serve stale data rather than a broken image if we have it
    if (cached) {
      return new Response(cached.data.buffer as ArrayBuffer, { headers: iconHeaders(3600) })
    }
    return new Response(null, { status: 404 })
  }
}
