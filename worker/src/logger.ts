import pino from "pino";

const loggerOptions = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: {
    transport: {
      target: "pino/file",
      options: {
        destination: "logs/worker.log",
        mkdir: true,
      },
    },
  },
};

const logger = pino(loggerOptions[process.env.NODE_ENV || "development"]);

export default logger;
