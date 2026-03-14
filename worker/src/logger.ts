import pino from "pino";

const loggerOptions = {
  development: {
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: {
    level: "info",
  },
};

const logger = pino(loggerOptions[process.env.NODE_ENV || "development"]);

export default logger;
