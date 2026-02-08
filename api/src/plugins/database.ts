import fastifyPlugin from "fastify-plugin";
import fastifyPostgres from "@fastify/postgres";
import { FastifyInstance } from "fastify";

async function dbConnector(fastify: FastifyInstance) {
  fastify.register(fastifyPostgres, {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "bustijden",
    user: process.env.DB_USER || "bustijden",
    password: process.env.DB_PASSWORD || "bustijden",
  });
}

export default fastifyPlugin(dbConnector);
