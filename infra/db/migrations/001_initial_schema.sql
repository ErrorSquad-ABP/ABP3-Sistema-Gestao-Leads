BEGIN;

CREATE SCHEMA IF NOT EXISTS lead_management;

CREATE TABLE IF NOT EXISTS lead_management.application_metadata (
	key text PRIMARY KEY,
	value text NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO lead_management.application_metadata (key, value)
VALUES
	('schema_baseline', '001_initial_schema'),
	('repository_strategy', 'single-repository'),
	('solution_style', 'next-front-nest-back')
ON CONFLICT (key) DO NOTHING;

COMMIT;
