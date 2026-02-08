import dayjs from "dayjs";
import { StopTimeRowWithRealtimeAndAlertType, StopTimeWithCalculatedFieldsType } from "./schemas.js";

export const getSecondsSinceMidnight = () => {
  const now = new Date();
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const oneHourAgo = seconds - 3600;
  return oneHourAgo >= 0 ? oneHourAgo : 0;
};

export const getDateToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const compute = (stop: StopTimeRowWithRealtimeAndAlertType): StopTimeWithCalculatedFieldsType => {
  const delay = stop.realtime.delay;
  return {
    ...stop,
    computed: {
      time: dayjs(stop.departure_time, "HH:mm:ss").add(delay, "second").format("HH:mm"),
      seconds: dayjs(stop.departure_time, "HH:mm:ss").add(delay, "second").diff(dayjs(), "second"),
      name: stop.stop_headsign || stop.trip_headsign || "",
    },
  };
};
