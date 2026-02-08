ALTER TABLE stops
ADD COLUMN stop_name_url text
GENERATED ALWAYS AS (lower(url_encode(stop_name))) STORED;

ALTER TABLE stop_times
ADD COLUMN departure_seconds INT
GENERATED ALWAYS AS (
  split_part(departure_time, ':', 1)::int * 3600 +
  split_part(departure_time, ':', 2)::int * 60 +
  split_part(departure_time, ':', 3)::int
) STORED;