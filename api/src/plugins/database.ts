import fastifyPlugin from "fastify-plugin";
import fastifyPostgres from "@fastify/postgres";
import { FastifyInstance } from "fastify";

async function dbConnector(fastify: FastifyInstance) {
  // @ts-ignore
  const config = fastify.config;
  fastify.register(fastifyPostgres, {
    host: process.env.DB_HOST || config.DB_HOST,
    port: process.env.DB_PORT || config.DB_PORT,
    database: process.env.DB_NAME || config.DB_NAME,
    user: process.env.DB_USER || config.DB_USER,
    password: process.env.DB_PASSWORD || config.DB_PASSWORD,
  });
}

export default fastifyPlugin(dbConnector);
