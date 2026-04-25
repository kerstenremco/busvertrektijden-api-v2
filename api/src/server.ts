import Fastify from "fastify";
import stopsRoute from "./routes/stops/router.js";
import { stopRoute } from "./routes/stop/router.js";
import database from "./plugins/database.js";
import redis from "./plugins/redis.js";
import envPlugin from "./plugins/env.js";
import swagger from "./plugins/swagger.js";
import hashIp from "./plugins/hash.js";
import { loggerOptions } from "./misc/options.js";

const env = process.env.NODE_ENV || "development";
const fastify = Fastify({
  logger: loggerOptions[env],
});

await fastify.register(envPlugin);
fastify.register(database);
fastify.register(redis);
fastify.register(swagger);

fastify.register(stopsRoute, { prefix: "/stops" });
fastify.register(stopRoute, { prefix: "/stop" });

// Hooks
fastify.addHook("onRequest", async (request) => {
  const ip = request.headers["cf-connecting-ip"] || request.headers["x-forwarded-for"];
  if (!ip) {
    request.headers["x-hashed-ip"] = "unknown";
    return;
  }
  if (Array.isArray(ip)) {
    request.headers["x-hashed-ip"] = hashIp(ip[0]);
    return;
  }
  request.headers["x-hashed-ip"] = hashIp(ip);
});

fastify.addHook("onRequest", async (request) => {
  const userAgent = request.headers["user-agent"];
  const isHomeAssistant = userAgent && (userAgent.toLowerCase().includes("python") || userAgent.toLowerCase().includes("aiohttp"));
  request.headers["x-is-home-assistant"] = isHomeAssistant ? "true" : "false";
});

// Start server
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
