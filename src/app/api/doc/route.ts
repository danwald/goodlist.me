import { getApiDocs } from "@/lib/swagger"

// AIDEV-NOTE: Serves the generated OpenAPI JSON spec at /api/doc
// Used as the spec source for the Scalar UI at /api/reference
export async function GET() {
  const spec = getApiDocs()
  return Response.json(spec)
}
