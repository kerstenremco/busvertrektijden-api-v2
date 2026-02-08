import { FastifyInstance } from "fastify";
import { AlertType, StopTimeRowType } from "./schemas.js";
import { RealtimeType } from "./schemas.js";

export const getAlertsForStops = async (stopIds: string[], fastify: FastifyInstance): Promise<AlertType[]> => {
  const stopAlerts: AlertType[] = [];

  const keys = stopIds.map((stopId) => `alert:${stopId}`);
  if (keys.length === 0) return [];
  const redisResults = await fastify.redis.mget(...keys);

  redisResults.forEach((result) => {
    if (!result) return;
    const parsed = JSON.parse(result);
    if (!parsed) return;
    parsed.forEach((alert) => {
      const parsedAlert = JSON.parse(alert) as AlertType;
      if (stopAlerts.some((a) => a["header"] === parsedAlert["header"])) return;
      stopAlerts.push(parsedAlert);
    });
  });
  return stopAlerts;
};

export const getTripUpdates = async (rows: StopTimeRowType[], fastify: FastifyInstance): Promise<RealtimeType[]> => {
  const keys = rows.map((row) => `tu:${row["stop_id"]}:${row["trip_id"]}`);
  if (keys.length === 0) return [];
  const redisResults = await fastify.redis.mget(...keys);

  const updates: RealtimeType[] = [];
  rows.forEach((_row, index) => {
    const { cancelled, delay } = redisResults[index] ? JSON.parse(redisResults[index]) : { cancelled: false, delay: 0 };
    updates[index] = { cancelled, delay };
  });

  return updates;
};

export const getAlerts = async (rows: StopTimeRowType[], fastify: FastifyInstance): Promise<AlertType[][]> => {
  const keys = rows.map((row) => `alert:${row["stop_id"]}:${row["route_id"]}`);
  if (keys.length === 0) return [];
  const redisResults = await fastify.redis.mget(...keys);

  const updates: AlertType[][] = [];

  rows.forEach((_row, index) => {
    if (!redisResults[index]) {
      updates[index] = [];
      return;
    }

    const arr = JSON.parse(redisResults[index]) as string[];
    updates[index] = arr.map((alert) => JSON.parse(alert) as AlertType);
  });

  return updates;
};
