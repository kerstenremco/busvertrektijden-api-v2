-- Create tables
CREATE TABLE "routes" (
    "route_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "route_short_name" TEXT,
    "route_long_name" TEXT,
    "route_desc" TEXT,
    "route_type" INTEGER NOT NULL,
    "route_color" TEXT,
    "route_text_color" TEXT,
    "route_url" TEXT,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("route_id")
);

CREATE TABLE "routes_staging" (
    "route_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "route_short_name" TEXT,
    "route_long_name" TEXT,
    "route_desc" TEXT,
    "route_type" INTEGER NOT NULL,
    "route_color" TEXT,
    "route_text_color" TEXT,
    "route_url" TEXT,

    PRIMARY KEY ("route_id")
);

CREATE TABLE "trips" (
    "route_id" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "realtime_trip_id" TEXT,
    "trip_headsign" TEXT,
    "trip_short_name" TEXT,
    "trip_long_name" TEXT,
    "direction_id" INTEGER,
    "block_id" INTEGER,
    "shape_id" INTEGER,
    "wheelchair_accessible" INTEGER,
    "bikes_allowed" INTEGER,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("trip_id")
);

CREATE TABLE "trips_staging" (
    "route_id" TEXT NOT NULL,
    "service_id" INTEGER NOT NULL,
    "trip_id" INTEGER NOT NULL,
    "realtime_trip_id" TEXT,
    "trip_headsign" TEXT,
    "trip_short_name" TEXT,
    "trip_long_name" TEXT,
    "direction_id" INTEGER,
    "block_id" INTEGER,
    "shape_id" INTEGER,
    "wheelchair_accessible" INTEGER,
    "bikes_allowed" INTEGER,

    PRIMARY KEY ("trip_id")
);

CREATE TABLE "calendar_dates" (
    "service_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "exception_type" INTEGER NOT NULL,

    CONSTRAINT "calendar_dates_pkey" PRIMARY KEY ("service_id","date")
);

CREATE TABLE "calendar_dates_staging" (
    "service_id" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "exception_type" INTEGER NOT NULL,

    PRIMARY KEY ("service_id","date")
);

CREATE TABLE "stop_times" (
    "trip_id" INTEGER NOT NULL,
    "stop_sequence" INTEGER NOT NULL,
    "stop_id" TEXT NOT NULL,
    "stop_headsign" TEXT,
    "arrival_time" TEXT NOT NULL,
    "departure_time" TEXT NOT NULL,
    "pickup_type" INTEGER,
    "drop_off_type" INTEGER,
    "timepoint" INTEGER,
    "shape_dist_traveled" DOUBLE PRECISION,
    "fare_units_traveled" DOUBLE PRECISION,

    CONSTRAINT "stop_times_pkey" PRIMARY KEY ("trip_id","stop_sequence")
);

CREATE TABLE "stop_times_staging" (
    "trip_id" INTEGER NOT NULL,
    "stop_sequence" INTEGER NOT NULL,
    "stop_id" TEXT NOT NULL,
    "stop_headsign" TEXT,
    "arrival_time" TEXT NOT NULL,
    "departure_time" TEXT NOT NULL,
    "pickup_type" INTEGER,
    "drop_off_type" INTEGER,
    "timepoint" INTEGER,
    "shape_dist_traveled" DOUBLE PRECISION,
    "fare_units_traveled" DOUBLE PRECISION,

    PRIMARY KEY ("trip_id","stop_sequence")
);

CREATE TABLE "stops" (
    "stop_id" TEXT NOT NULL,
    "stop_code" TEXT,
    "stop_name" TEXT,
    "stop_lat" TEXT,
    "stop_lon" TEXT,
    "location_type" INTEGER,
    "parent_station" TEXT,
    "stop_timezone" TEXT,
    "wheelchair_boarding" INTEGER,
    "platform_code" TEXT,
    "zone_id" TEXT,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("stop_id")
);

CREATE TABLE "stops_staging" (
    "stop_id" TEXT NOT NULL,
    "stop_code" TEXT,
    "stop_name" TEXT,
    "stop_lat" TEXT,
    "stop_lon" TEXT,
    "location_type" INTEGER,
    "parent_station" TEXT,
    "stop_timezone" TEXT,
    "wheelchair_boarding" INTEGER,
    "platform_code" TEXT,
    "zone_id" TEXT,

    PRIMARY KEY ("stop_id")
);

-- Create foreign keys
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("route_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stop_times" ADD CONSTRAINT "stop_times_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("trip_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stop_times" ADD CONSTRAINT "stop_times_stop_id_fkey" FOREIGN KEY ("stop_id") REFERENCES "stops"("stop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Time
ALTER TABLE stop_times
ADD COLUMN departure_seconds INT
GENERATED ALWAYS AS (
  split_part(departure_time, ':', 1)::int * 3600 +
  split_part(departure_time, ':', 2)::int * 60 +
  split_part(departure_time, ':', 3)::int
) STORED;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Materialized view
CREATE MATERIALIZED VIEW TODAY_ACTIVE_TRIPS AS SELECT T.* FROM TRIPS T JOIN CALENDAR_DATES CD ON CD.SERVICE_ID = T.SERVICE_ID WHERE CD.DATE = TO_CHAR(CURRENT_DATE, 'YYYYMMDD');


-- Indexes
CREATE INDEX idx_stop_times_stop_departure
ON STOP_TIMES (STOP_ID, DEPARTURE_SECONDS);

CREATE INDEX idx_today_active_trips_trip
ON TODAY_ACTIVE_TRIPS (TRIP_ID);

CREATE INDEX idx_today_active_trips_route
ON TODAY_ACTIVE_TRIPS (ROUTE_ID);

CREATE INDEX idx_stop_times_trip
ON STOP_TIMES (TRIP_ID);

CREATE INDEX idx_stops_name_lower
ON STOPS (lower(STOP_NAME));

CREATE INDEX idx_stops_parent_station
ON STOPS (PARENT_STATION);

CREATE INDEX idx_routes_type_id
ON ROUTES (ROUTE_TYPE, ROUTE_ID);

-- Functions
CREATE OR REPLACE FUNCTION search_stops(
    p_search TEXT
)
RETURNS TABLE (
    stop_name TEXT,
    score     REAL
)
LANGUAGE sql
STABLE
AS $$
    SELECT DISTINCT s.stop_name, word_similarity(lower(p_search), lower(s.stop_name)) AS score
    FROM stops s
    WHERE lower(s.stop_name) ILIKE ALL (
        SELECT '%' || word || '%'
        FROM regexp_split_to_table(lower(p_search), '\s+') AS word
    ) AND s.parent_station IS NULL
    ORDER BY score DESC
    LIMIT 50;
$$;

CREATE OR REPLACE FUNCTION get_departures_by_stopname(p_stopname TEXT, p_min_departure_seconds INT DEFAULT 0)
RETURNS TABLE (
    stop_id TEXT,
    arrival_time TEXT,
    departure_time TEXT,
    stop_headsign TEXT,
    stop_name TEXT,
    platform_code TEXT,
    route_id TEXT,
    route_short_name TEXT,
    route_long_name TEXT,
    route_color TEXT,
    route_text_color TEXT,
    trip_id TEXT,
    trip_headsign TEXT,
    trip_short_name TEXT,
    trip_long_name TEXT
)
LANGUAGE sql
STABLE
AS $$
WITH MATCHING_STATIONS AS (
    SELECT STOP_ID
    FROM STOPS
    WHERE lower(STOP_NAME) = lower(p_stopname)
      AND LOCATION_TYPE = 1
),
RELEVANT_STOPS AS (
    SELECT STOP_ID
    FROM MATCHING_STATIONS
    UNION
    SELECT s.STOP_ID
    FROM STOPS s
    JOIN MATCHING_STATIONS ms
      ON s.PARENT_STATION = ms.STOP_ID
    UNION
    SELECT STOP_ID
    FROM STOPS
    WHERE lower(STOP_NAME) = lower(p_stopname)
      AND LOCATION_TYPE = 0
),
BUS_ROUTES AS (
    SELECT ROUTE_ID,
           ROUTE_SHORT_NAME,
           ROUTE_LONG_NAME,
           ROUTE_COLOR,
           ROUTE_TEXT_COLOR
    FROM ROUTES
    WHERE ROUTE_TYPE = 3
)
SELECT
    ST.STOP_ID,
    ST.ARRIVAL_TIME,
    ST.DEPARTURE_TIME,
    ST.STOP_HEADSIGN,
    S.STOP_NAME,
    S.PLATFORM_CODE,
    R.ROUTE_ID,
    R.ROUTE_SHORT_NAME,
    R.ROUTE_LONG_NAME,
    R.ROUTE_COLOR,
    R.ROUTE_TEXT_COLOR,
    T.TRIP_ID,
    T.TRIP_HEADSIGN,
    T.TRIP_SHORT_NAME,
    T.TRIP_LONG_NAME
FROM STOP_TIMES ST
JOIN RELEVANT_STOPS RS
    ON RS.STOP_ID = ST.STOP_ID
JOIN TODAY_ACTIVE_TRIPS T
    ON T.TRIP_ID = ST.TRIP_ID
JOIN BUS_ROUTES R
    ON R.ROUTE_ID = T.ROUTE_ID
JOIN STOPS S
    ON S.STOP_ID = ST.STOP_ID
WHERE ST.DEPARTURE_SECONDS >= 0
ORDER BY ST.DEPARTURE_SECONDS
$$;