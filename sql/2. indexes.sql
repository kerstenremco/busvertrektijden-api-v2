-- 1. stop_times (CRITICAL)
CREATE INDEX idx_stop_times_stop_departure
ON stop_times (stop_id, departure_seconds)
INCLUDE (trip_id, arrival_time, departure_time, stop_headsign);

-- 2. stops (case-insensitive lookup)
CREATE INDEX idx_stops_lower_name_location
ON stops (lower(stop_name), location_type, stop_id);

-- 3. stops parent
CREATE INDEX idx_stops_parent_station
ON stops (parent_station, stop_id);

-- 4. calendar_dates
CREATE INDEX idx_calendar_dates_date_service
ON calendar_dates (date, service_id);

-- 5. trips
CREATE INDEX idx_trips_service_route
ON trips (service_id, route_id, trip_id);

-- 6. routes (partial index)
CREATE INDEX idx_routes_type3
ON routes (route_id)
WHERE route_type = 3;
