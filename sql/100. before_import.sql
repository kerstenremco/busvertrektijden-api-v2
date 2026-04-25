-- Remove function get_departures_by_stopname
DROP FUNCTION IF EXISTS get_departures_by_stopname(TEXT, INT);
DROP FUNCTION IF EXISTS search_stops(TEXT);

-- Remove index
DROP INDEX IF EXISTS idx_stop_times_stop_departure;
DROP INDEX IF EXISTS idx_today_active_trips_trip;
DROP INDEX IF EXISTS idx_today_active_trips_route;
DROP INDEX IF EXISTS idx_stop_times_trip;
DROP INDEX IF EXISTS idx_stops_name_lower;
DROP INDEX IF EXISTS idx_stops_parent_station;
DROP INDEX IF EXISTS idx_routes_type_id;

-- Remove materialized view
DROP MATERIALIZED VIEW IF EXISTS TODAY_ACTIVE_TRIPS;

-- Remove generated columns
ALTER TABLE stop_times DROP COLUMN IF EXISTS departure_seconds;
ALTER TABLE stops DROP COLUMN IF EXISTS stop_name_url;

-- Remove tables
TRUNCATE TABLE stop_times CASCADE;
TRUNCATE TABLE stops CASCADE;
TRUNCATE TABLE trips CASCADE;
TRUNCATE TABLE routes CASCADE;
TRUNCATE TABLE calendar_dates CASCADE;