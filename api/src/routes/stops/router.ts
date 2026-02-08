import { FastifyInstance } from "fastify";
import { SearchSchema, SearchQueryType } from "./schemas.js";

const stopsRoute = async (fastify: FastifyInstance) => {
  fastify.get<{ Querystring: SearchQueryType }>("/", { schema: SearchSchema }, async (request) => {
    // Input
    const { search } = request.query;

    // Query
    const result = await fastify.pg.query("SELECT * FROM search_stops($1)", [search]);

    // Response
    return { result: result.rows };
  });
};

export default stopsRoute;
