CREATE OR REPLACE FUNCTION get_departures_by_stopname(
  p_stopname TEXT,
  p_min_departure_seconds INT DEFAULT 0
)
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
  WITH RELEVANT_STOPS AS (
    SELECT s1.STOP_ID
    FROM STOPS s1
    LEFT JOIN STOPS parent
        ON parent.STOP_ID = s1.PARENT_STATION
    WHERE
        (s1.STOP_NAME = p_stopname AND s1.LOCATION_TYPE = 0)
        OR
        (parent.STOP_NAME = p_stopname AND parent.LOCATION_TYPE = 1)
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
LIMIT 20;
$$;
