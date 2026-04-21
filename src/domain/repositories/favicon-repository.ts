export interface FaviconRepository {
  findByDomain(domain: string): Promise<{ data: Uint8Array<ArrayBuffer>; fetchedAt: Date } | null>
  upsert(domain: string, data: Uint8Array<ArrayBuffer>): Promise<void>
}
