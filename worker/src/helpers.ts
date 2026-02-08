import { createClient } from "redis";
import logger from "./logger.js";

interface TimeSchema {
  cron: string;
  ttlForRedis: number;
}

const getTimeSchemaForUpdates = (): TimeSchema => {
  const minutes = process.env.UPDATES_TTL_MIN || 1;
  const cron = `50 */${minutes} * * * *`;
  const ttlForRedis = Number(minutes) * 60 * 2;
  return { cron, ttlForRedis };
};

const getTimeSchemaForAlerts = (): TimeSchema => {
  const minutes = process.env.ALERTS_TTL_MI || 2;
  const cron = `*/${minutes} * * * *`;
  const ttlForRedis = Number(minutes) * 60 * 2;
  return { cron, ttlForRedis };
};

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.connect();

const options: Record<"alerts" | "tripUpdates", { url: string; lastModified: string | undefined }> = {
  alerts: {
    url: "https://gtfs.ovapi.nl/nl/alerts.pb",
    lastModified: undefined,
  },
  tripUpdates: {
    url: "https://gtfs.ovapi.nl/nl/tripUpdates.pb",
    lastModified: undefined, //TODO: check if working
  },
};

const downloader = async (feed: "alerts" | "tripUpdates") => {
  const userAgent = process.env.USER_AGENT;
  if (!userAgent) {
    throw new Error("USER_AGENT environment variable is not set");
  }

  const url = options[feed].url;
  const response = await fetch(url, {
    headers: {
      "User-Agent": userAgent,
      "If-Modified-Since": options[feed].lastModified,
    },
  });

  if (response.status === 304) {
    logger.info("Not modified");
    return;
  }

  if (response.status === 200) {
    options[feed].lastModified = response.headers.get("Last-Modified") || undefined;
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
};

export { redisClient, downloader, getTimeSchemaForUpdates, getTimeSchemaForAlerts };
