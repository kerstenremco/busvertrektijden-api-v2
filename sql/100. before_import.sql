-- Remove function get_departures_by_stopname
DROP FUNCTION IF EXISTS get_departures_by_stopname(TEXT, INT);
DROP FUNCTION IF EXISTS search_stops(TEXT);

-- Remove index
DROP INDEX IF EXISTS idx_stop_times_stop_departure;
DROP INDEX IF EXISTS idx_today_active_trips_trip;
DROP INDEX IF EXISTS idx_today_active_trips_route;
DROP INDEX IF EXISTS idx_stop_times_trip;

-- Remove materialized view
DROP MATERIALIZED VIEW IF EXISTS TODAY_ACTIVE_TRIPS;

-- Remove generated columns
ALTER TABLE stop_times DROP COLUMN IF EXISTS departure_seconds;
ALTER TABLE stops DROP COLUMN IF EXISTS stop_name_url;