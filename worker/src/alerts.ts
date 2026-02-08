import gtfs from "gtfs-realtime-bindings";
import dayjs from "dayjs";
import { redisClient, downloader, getTimeSchemaForAlerts } from "./helpers.js";
import logger from "./logger.js";

interface Alert {
  start: number;
  end: number;
  cause: number;
  effect: number;
  header: string;
  description?: string;
}

const checkIfAlertIsStopRelated = (alert: gtfs.transit_realtime.IAlert) => {
  const routeId = alert.informedEntity?.at(0)?.routeId;
  return !routeId;
};

const checkIfAlertIsToday = (alert: gtfs.transit_realtime.IAlert) => {
  const isStopRelated = checkIfAlertIsStopRelated(alert);
  const start = Number(alert.activePeriod?.at(0)?.start);
  const end = Number(alert.activePeriod?.at(0)?.end);

  if (isStopRelated) {
    const now = dayjs().unix();
    return start < now && end > now;
  } else {
    // Check if timewindow is within the rest of the day
    const now = dayjs().unix();
    const endOfDay = dayjs().endOf("day").unix();
    return start < endOfDay && end > now;
  }
};

const transform = (entity: gtfs.transit_realtime.IFeedEntity[]) => {
  const result: { key: string; body: Alert }[] = [];

  // Filter alerts active today
  const alertsToday = entity.filter((e) => {
    if (!e.alert) return false;
    return checkIfAlertIsToday(e.alert);
  });

  // Process each alert
  alertsToday.forEach((entity) => {
    const alert = entity.alert!;
    const isStopRelated = checkIfAlertIsStopRelated(alert);
    const start = Number(alert.activePeriod?.at(0)?.start);
    const end = Number(alert.activePeriod?.at(0)?.end);

    // Get cause and effect and text
    const { cause, effect } = alert;
    const headerText = alert.headerText?.translation?.at(0)?.text;
    let descriptionText = alert.descriptionText?.translation?.at(0)?.text;
    if (!headerText) return;

    if (descriptionText) {
      if (descriptionText.trim() == headerText.trim()) descriptionText = undefined;
    }

    // Create body
    const body = JSON.stringify({ start, end, cause, effect, header: headerText, description: descriptionText });

    // Store in result
    alert.informedEntity?.forEach((informedEntity) => {
      // Create key
      let key = `alert:${informedEntity.stopId}`;
      if (!isStopRelated) key += `:${informedEntity.routeId}`;

      // Store in result
      if (!result[key]) {
        result[key] = [body];
      } else {
        if (!result[key].includes(body)) {
          result[key].push(body);
        }
      }
    });
  });

  return result;
};

const store = async (updates: { key: string; body: Alert }[]) => {
  const pipeline = redisClient.multi();
  for (const [key, body] of Object.entries(updates)) {
    pipeline.set(key, JSON.stringify(body));
    pipeline.expire(key, getTimeSchemaForAlerts().ttlForRedis);
  }
  await pipeline.exec();
};

const main = async () => {
  logger.info("Fetching alerts.");

  const downloaded = await downloader("alerts");
  if (!downloaded) {
    logger.info("No new alerts.");
    return;
  }

  const feed = gtfs.transit_realtime.FeedMessage.decode(downloaded);
  const updates = transform(feed.entity);
  await store(updates);
  logger.info(`Stored ${Object.keys(updates).length} alerts.`);
};

export default main;
