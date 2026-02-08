export const loggerOptions = {
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
        destination: "logs/api.log",
        mkdir: true,
      },
    },
  },
};
