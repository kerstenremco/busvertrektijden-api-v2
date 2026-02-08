-- Stops
CREATE INDEX idx_stops_lower_stop_name
ON stops USING btree (lower(stop_name));

CREATE INDEX idx_stops_parent_station
ON stops USING btree (parent_station);

CREATE INDEX idx_stops_location_type
ON stops USING btree (location_type);

-- Stop times
CREATE INDEX idx_stop_times_stop_departure
ON stop_times USING btree (stop_id, departure_seconds);

-- Calendar
CREATE INDEX calendar_dates_service_date_idx ON public.calendar_dates USING btree (service_id, date);

-- Routes
CREATE INDEX idx_routes_route_type_id
ON routes USING btree (route_type, route_id);

-- Names


CREATE INDEX idx_stops_stop_name_trgm
ON stops
USING gin (lower(stop_name) gin_trgm_ops);

CREATE INDEX idx_stops_parent_station_null
ON stops USING btree (parent_station)
WHERE parent_station IS NULL;