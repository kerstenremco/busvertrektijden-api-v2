import { Type, Static } from "@sinclair/typebox";

const nullableString = Type.Optional(Type.Union([Type.String(), Type.Null()]));
const string = Type.String();
const integer = Type.Integer();
const boolean = Type.Boolean();

// Request schemas
const StopByNameQuerySchema = Type.Object({
  date: Type.Optional(Type.String({ pattern: "^20[0-9]{6}$" })),
  filternumbers: Type.Optional(Type.String({ maxLength: 100, pattern: "^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$" })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
});

export type StopByNameQueryType = Static<typeof StopByNameQuerySchema>;

const StopByNameParamsSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 100, pattern: "^[A-Za-z0-9 _\\-.,'\"]+$" }),
});

export type StopByNameParamsType = Static<typeof StopByNameParamsSchema>;

// DB rows
const StopTimeRowSchema = Type.Object({
  stop_id: string,
  arrival_time: nullableString,
  departure_time: string,
  stop_headsign: nullableString,
  stop_name: string,
  platform_code: nullableString,
  route_id: string,
  route_short_name: nullableString,
  route_long_name: nullableString,
  route_color: nullableString,
  route_text_color: nullableString,
  trip_id: string,
  trip_headsign: nullableString,
  trip_short_name: nullableString,
  trip_long_name: nullableString,
});

export type StopTimeRowType = Static<typeof StopTimeRowSchema>;

// Realtime schemas
const AlertSchema = Type.Object({
  start: integer,
  end: integer,
  cause: integer,
  effect: integer,
  header: string,
  description: nullableString,
});

export type AlertType = Static<typeof AlertSchema>;

const RealtimeSchema = Type.Object({
  cancelled: boolean,
  delay: integer,
});

export type RealtimeType = Static<typeof RealtimeSchema>;

// Computed schemas
const ComputedSchema = Type.Object({
  time: string,
  seconds: integer,
  name: string,
});

export type ComputedType = Static<typeof ComputedSchema>;

// Result schemas
const StopTimeRowWithRealtimeAndAlertSchema = Type.Intersect([
  StopTimeRowSchema,
  Type.Object({
    alerts: Type.Optional(Type.Array(AlertSchema)),
    realtime: RealtimeSchema,
  }),
]);

export type StopTimeRowWithRealtimeAndAlertType = Static<typeof StopTimeRowWithRealtimeAndAlertSchema>;

const StopTimeWithCalculatedFieldsSchema = Type.Intersect([
  StopTimeRowWithRealtimeAndAlertSchema,
  Type.Object({
    computed: ComputedSchema,
  }),
]);

export type StopTimeWithCalculatedFieldsType = Static<typeof StopTimeWithCalculatedFieldsSchema>;

// Response

const StopTimeSchema = Type.Object({
  stop_alerts: Type.Array(AlertSchema),
  stop_times: Type.Array(StopTimeWithCalculatedFieldsSchema),
});

export type StopTimeType = Static<typeof StopTimeSchema>;

export const Response200Schema = Type.Object({
  result: StopTimeSchema,
});

const Response404Schema = Type.Object({
  message: Type.String(),
});

// Optional: Full search schema mapping queries to responses
export const Schema = {
  query: StopByNameQuerySchema,
  params: StopByNameParamsSchema,
  response: {
    200: Response200Schema,
    404: Response404Schema,
  },
};
