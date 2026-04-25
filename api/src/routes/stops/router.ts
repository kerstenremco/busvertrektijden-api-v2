import { FastifyInstance } from "fastify";
import { SearchSchema, SearchQueryType } from "./schemas.js";

const encodeURIComponent = (str: string) => {
  // Nodig ivm backwards comp sql function
  const encoder = new TextEncoder();
  let result = "";
  for (const ch of str) {
    if (/^[A-Za-z0-9_.~-]$/.test(ch)) {
      result += ch;
    } else {
      const bytes = encoder.encode(ch);
      for (const byte of bytes) {
        result += "%" + byte.toString(16).toUpperCase().padStart(2, "0");
      }
    }
  }
  return result.toLowerCase();
};

const stopsRoute = async (fastify: FastifyInstance) => {
  fastify.get<{ Querystring: SearchQueryType }>("/", { schema: SearchSchema }, async (request) => {
    // Input
    const { search } = request.query;

    // Query
    const result = await fastify.pg.query("SELECT * FROM search_stops($1)", [search]);

    // Log
    request.log.info(`[STOPS SEARCH] search: ${search}, results: ${result.rowCount}`);

    // Add URL field to each result item

    result.rows.forEach((row) => {
      row.stop_name_url = encodeURIComponent(row.stop_name);
    });

    // Response
    return { result: result.rows };
  });
};

export default stopsRoute;
