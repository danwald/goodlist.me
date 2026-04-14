import { ApiReference } from "@scalar/nextjs-api-reference"

// AIDEV-NOTE: Serves the Scalar API reference UI at /api/reference
// Spec is fetched from /api/doc at runtime — no static file needed
export const GET = ApiReference({
  url: "/api/doc",
  pageTitle: "goodlist.me API Reference",
})
