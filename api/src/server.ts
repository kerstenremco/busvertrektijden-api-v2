import Fastify from "fastify";
import stopsRoute from "./routes/stops/router.js";
import { stopRoute } from "./routes/stop/router.js";
import database from "./plugins/database.js";
import redis from "./plugins/redis.js";
import swagger from "./plugins/swagger.js";
import { loggerOptions } from "./misc/options.js";

const env = process.env.NODE_ENV || "development";
const fastify = Fastify({
  logger: loggerOptions[env],
});

fastify.register(database);
fastify.register(redis);
fastify.register(swagger);

fastify.register(stopsRoute, { prefix: "/stops" });
fastify.register(stopRoute, { prefix: "/stop" });
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
