import { Static, Type } from "@sinclair/typebox";

// Query
const SearchQuerySchema = Type.Object({
  search: Type.String({ minLength: 1, maxLength: 100, pattern: "^[A-Za-z0-9 _\\-.,'\"]+$" }),
});

export type SearchQueryType = Static<typeof SearchQuerySchema>;

const SearchResultItemSchema = Type.Object({
  stop_name: Type.String(),
  stop_name_url: Type.String({ format: "uri" }),
});

const SearchResponse200Schema = Type.Object({
  result: Type.Array(SearchResultItemSchema),
});

const SearchResponse404Schema = Type.Object({
  message: Type.String(),
});

// Optional: Full search schema mapping queries to responses
export const SearchSchema = {
  query: SearchQuerySchema,
  response: {
    200: SearchResponse200Schema,
    404: SearchResponse404Schema,
  },
};
