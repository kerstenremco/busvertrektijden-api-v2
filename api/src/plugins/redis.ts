import fastifyPlugin from "fastify-plugin";
import { fastifyRedis } from "@fastify/redis";
import { FastifyInstance } from "fastify";

async function redisConnector(fastify: FastifyInstance) {
  const host = process.env.REDIS_HOST || "localhost";
  const port = Number(process.env.REDIS_PORT) || 6379;
  fastify.register(fastifyRedis, {
    host,
    port,
  });
}

export default fastifyPlugin(redisConnector);
