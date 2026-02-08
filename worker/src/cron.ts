import cron from "node-cron";
import updates from "./updates.js";
import alerts from "./alerts.js";
import { getTimeSchemaForUpdates, getTimeSchemaForAlerts } from "./helpers.js";
import logger from "./logger.js";
import "dotenv/config";

const main = () => {
  logger.info("Starting worker...");
  const timeSchemaForUpdates = getTimeSchemaForUpdates();
  const timeSchemaForAlerts = getTimeSchemaForAlerts();
  logger.info("Starting cron jobs...");
  cron.schedule(timeSchemaForUpdates.cron, updates);
  cron.schedule(timeSchemaForAlerts.cron, alerts);

  // First run
  updates();
  alerts();
};

main();
