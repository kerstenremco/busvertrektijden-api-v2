import * as z from "zod";

export const departureByStopnameSchema = z.object({
  stop_id: z.string(),

  arrival_time: z.string().nullable(), // HH:MM:SS
  departure_time: z.string(), // HH:MM:SS
  stop_headsign: z.string().nullable(),

  stop_name: z.string(),
  platform_code: z.string().nullable(),

  route_id: z.string(),
  route_short_name: z.string().nullable(),
  route_long_name: z.string().nullable(),
  route_color: z.string().nullable(),
  route_text_color: z.string().nullable(),

  trip_id: z.string(),
  trip_headsign: z.string().nullable(),
  trip_short_name: z.string().nullable(),
  trip_long_name: z.string().nullable(),
});

export type StopDepartureRow = z.infer<typeof departureByStopnameSchema>;
