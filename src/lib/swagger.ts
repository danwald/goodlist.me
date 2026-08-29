import { createSwaggerSpec } from "next-swagger-doc"

// AIDEV-NOTE: Generates OpenAPI 3.0 spec by scanning JSDoc @swagger blocks in src/app/api/**
// Shared component schemas (List, Item, Error) are defined here and referenced in route JSDoc.
export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "goodlist.me API",
        version: "1.0.0",
        description: "REST API for goodlist.me — curated lists app",
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "authjs.session-token",
            description: "NextAuth.js session cookie (set automatically on login)",
          },
        },
        schemas: {
          List: {
            type: "object",
            properties: {
              id: { type: "string", example: "cm123abc" },
              title: { type: "string", example: "My Reading List" },
              description: { type: "string", nullable: true, example: "Books I want to read" },
              slug: { type: "string", example: "my-reading-list" },
              isPublic: { type: "boolean", example: false },
              ownerId: { type: "string", example: "cm456def" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          Item: {
            type: "object",
            properties: {
              id: { type: "string", example: "cm789ghi" },
              content: { type: "string", example: "The Pragmatic Programmer" },
              position: { type: "integer", example: 0 },
              listId: { type: "string", example: "cm123abc" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          // AIDEV-NOTE: a List plus one paginated page of its items — returned by
          // GET /api/lists/{listId}. Keep in sync with that route's response shape.
          ListPage: {
            type: "object",
            allOf: [
              { $ref: "#/components/schemas/List" },
              {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Item" },
                  },
                  page: { type: "integer", example: 1, description: "1-indexed current page" },
                  pageSize: { type: "integer", example: 50 },
                  total: {
                    type: "integer",
                    example: 1000,
                    description: "Total number of items in the list, across all pages",
                  },
                },
              },
            ],
          },
          Error: {
            type: "object",
            properties: {
              error: {
                oneOf: [
                  { type: "string", example: "Unauthorized" },
                  { type: "object", description: "Field validation errors" },
                ],
              },
            },
          },
        },
      },
    },
  })
}
