CREATE OR REPLACE FUNCTION get_departures_by_stopname(
  p_stopname TEXT,
  p_date TEXT,
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
  WITH relevant_stops AS ( SELECT stop_id FROM stops WHERE ( lower(stop_name) = p_stopname AND location_type = 0 ) OR parent_station IN ( SELECT stop_id FROM stops WHERE lower(stop_name) = p_stopname AND location_type = 1 ) ) SELECT st.stop_id, st.arrival_time, st.departure_time, st.stop_headsign, s.stop_name, s.platform_code, r.route_id, r.route_short_name, r.route_long_name, r.route_color, r.route_text_color, t.trip_id, t.trip_headsign, t.trip_short_name, t.trip_long_name FROM stop_times st JOIN relevant_stops rs ON rs.stop_id = st.stop_id JOIN stops s ON s.stop_id = st.stop_id JOIN trips t ON t.trip_id = st.trip_id JOIN calendar_dates cd ON cd.service_id = t.service_id AND cd.date = p_date JOIN routes r ON r.route_id = t.route_id AND r.route_type = 3 WHERE st.departure_seconds >= p_min_departure_seconds ORDER BY st.departure_seconds;
$$;
