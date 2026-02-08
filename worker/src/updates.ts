import gtfs from "gtfs-realtime-bindings";
import { redisClient, downloader, getTimeSchemaForUpdates } from "./helpers.js";
import logger from "./logger.js";

interface TripUpdate {
  stopId: string;
  tripId: string;
  cancelled: boolean;
  delay: number;
}

const transform = (entity: gtfs.transit_realtime.IFeedEntity[]) => {
  const result: { key: string; body: TripUpdate }[] = [];

  const tripUpdatesToday = entity.filter((e) => e.tripUpdate?.trip.startDate == today());

  for (const entity of tripUpdatesToday) {
    if (!entity.tripUpdate || !entity.tripUpdate.trip || !entity.tripUpdate.trip.tripId || !entity.tripUpdate.stopTimeUpdate) continue;
    const tripId = entity.tripUpdate.trip.tripId;

    for (const stu of entity.tripUpdate.stopTimeUpdate) {
      if (!stu.stopId) continue;
      const stopId = stu.stopId;
      const cancelled = stu.scheduleRelationship === 2;
      const delay = stu.departure?.delay || 0;

      const key = `tu:${stopId}:${tripId}`;
      result.push({ key, body: { stopId, tripId, cancelled, delay } });
    }
  }
  return result;
};

const store = async (updates: { key: string; body: TripUpdate }[]) => {
  const pipeline = redisClient.multi();
  for (const update of updates) {
    pipeline.set(update.key, JSON.stringify(update.body));
    pipeline.expire(update.key, getTimeSchemaForUpdates().ttlForRedis);
  }
  await pipeline.exec();
};

const today = () => {
  const today = new Date();
  const yyyymmdd = today.getFullYear().toString() + String(today.getMonth() + 1).padStart(2, "0") + String(today.getDate()).padStart(2, "0");
  return yyyymmdd;
};

const main = async () => {
  logger.info("Fetching trip updates.");

  const downloaded = await downloader("tripUpdates");
  if (!downloaded) {
    logger.info("No new trip updates.");
    return;
  }

  const feed = gtfs.transit_realtime.FeedMessage.decode(downloaded);
  const updates = transform(feed.entity);

  await store(updates);
  logger.info(`Stored ${updates.length} trip updates.`);
};

export default main;
