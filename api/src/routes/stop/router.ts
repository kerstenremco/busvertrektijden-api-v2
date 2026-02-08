import { StopTimeRowType, StopByNameQueryType, StopByNameParamsType, Schema, StopTimeRowWithRealtimeAndAlertType, StopTimeType } from "./schemas.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { FastifyInstance } from "fastify";
import { compute, getDateToday, getSecondsSinceMidnight } from "./helpers.js";
import { getAlertsForStops } from "./realtime.js";
import { getTripUpdates, getAlerts } from "./realtime.js";
dayjs.extend(customParseFormat);

export const stopRoute = async (fastify: FastifyInstance) => {
  fastify.get<{ Params: StopByNameParamsType; Querystring: StopByNameQueryType }>(
    "/:name",
    {
      schema: Schema,
    },
    async (request) => {
      const { name } = request.params;
      const { date, filternumbers, limit } = request.query;

      const result = await getStopsByName(name, date, filternumbers, limit, fastify);
      return { result };
    },
  );
};

const getStopsByName = async (
  name: string,
  date: string | undefined,
  filternumbers: string | undefined,
  limit: number | undefined,
  fastify: FastifyInstance,
): Promise<StopTimeType> => {
  // Date
  const dateParam = date || getDateToday();
  const seconds = date ? 0 : getSecondsSinceMidnight();
  const numbersFilter = filternumbers ? filternumbers.split(",") : [];

  // Query database
  let rows = await getStopsFromDB(name, dateParam, seconds, fastify);

  // Filter
  if (numbersFilter.length > 0) {
    rows = rows.filter((row) => row.route_short_name && numbersFilter.includes(row.route_short_name));
  }

  const stopIds = [...new Set(rows.map((row) => row.stop_id))];
  const stopAlerts = await getAlertsForStops(stopIds, fastify);

  // Get updates
  const tripUpdates = await getTripUpdates(rows, fastify);

  // Get alerts for each row
  const alerts = await getAlerts(rows, fastify);

  // Compute
  const stopTimesWithRealtimeAndAlerts: StopTimeRowWithRealtimeAndAlertType[] = rows.map((row, index) => {
    return {
      ...row,
      realtime: tripUpdates[index],
      alerts: alerts[index],
    };
  });

  let computedStopTimes = stopTimesWithRealtimeAndAlerts.map((stop) => compute(stop));

  //If no date param, filter out past departures
  if (!date) {
    computedStopTimes = computedStopTimes.filter((stop) => stop.computed.seconds >= 0);
  }

  // Sort by seconds until departure
  computedStopTimes.sort((a, b) => a.computed.seconds - b.computed.seconds);

  // Limit to 20 departures
  computedStopTimes = computedStopTimes.slice(0, limit ?? 20);

  return { stop_alerts: stopAlerts, stop_times: computedStopTimes };
};

const getStopsFromDB = async (name: string, date: string, seconds: number, fastify: FastifyInstance): Promise<StopTimeRowType[]> => {
  const result = await fastify.pg.query("SELECT * FROM get_departures_by_stopname($1, $2, $3)", [name, date, seconds]);
  const rows = result.rows as StopTimeRowType[];
  return rows;
};
