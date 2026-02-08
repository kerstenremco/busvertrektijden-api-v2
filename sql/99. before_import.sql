ALTER TABLE stop_times DROP COLUMN IF EXISTS departure_seconds;
ALTER TABLE stops DROP COLUMN IF EXISTS stop_name_url;

-- After
