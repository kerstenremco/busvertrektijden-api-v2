import fastifyPlugin from "fastify-plugin";
import { fastifyRedis } from "@fastify/redis";
import { FastifyInstance } from "fastify";

async function redisConnector(fastify: FastifyInstance) {
  // @ts-ignore
  const config = fastify.config;
  const host = process.env.REDIS_HOST || config.REDIS_HOST;
  const port = Number(process.env.REDIS_PORT) || config.REDIS_PORT;
  fastify.register(fastifyRedis, {
    host,
    port,
  });
}

export default fastifyPlugin(redisConnector);
