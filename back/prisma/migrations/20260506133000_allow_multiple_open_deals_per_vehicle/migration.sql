-- Multiple leads may be negotiating the same vehicle at the same time.
DROP INDEX IF EXISTS "Deal_one_open_per_vehicle_idx";
