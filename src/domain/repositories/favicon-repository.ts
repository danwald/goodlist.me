export interface FaviconRepository {
  findByDomain(domain: string): Promise<{ data: Buffer; fetchedAt: Date } | null>
  upsert(domain: string, data: Buffer): Promise<void>
}
