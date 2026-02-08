import fastifyPlugin from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import { FastifyInstance } from "fastify";
import fastifySwaggerUi from "@fastify/swagger-ui";

async function swagger(fastify: FastifyInstance) {
  if (process.env.NODE_ENV != "development") {
    return;
  }
  fastify.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Busvertrektijden API",
        description: "API for fetching bus departure times in the Netherlands",
        version: "2.0.0",
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
        {
          url: "https://apiv2.busvertrektijden.nl",
          description: "Production server",
        },
      ],
      tags: [{ name: "default", description: "General end-points" }],
      components: {},
      externalDocs: {
        url: "https://github.com/kerstenremco/busvertrektijden-api",
        description: "GitHub repository",
      },
    },
  });

  // UI
  fastify.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => swaggerObject,
    transformSpecificationClone: true,
  });
}

export default fastifyPlugin(swagger);
