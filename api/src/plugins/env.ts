import fastifyPlugin from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import { FastifyInstance } from "fastify";

const schema = {
  type: "object",
  properties: {
    DB_NAME: {
      type: "string",
      default: "bustijden",
    },
    DB_USER: {
      type: "string",
      default: "bustijden",
    },
    DB_PASSWORD: {
      type: "string",
      default: "bustijden",
    },
    DB_HOST: {
      type: "string",
      default: "localhost",
    },
    DB_PORT: {
      type: "number",
      default: 5432,
    },
    REDIS_HOST: {
      type: "string",
      default: "localhost",
    },
    REDIS_PORT: {
      type: "number",
      default: 6379,
    },
  },
};

const options = {
  schema: schema,
  dotenv: true,
  data: process.env,
};

async function envWrapper(fastify: FastifyInstance) {
  await fastify.register(fastifyEnv, options);
}

export default fastifyPlugin(envWrapper);
