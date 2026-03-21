#!/bin/sh
set -eu

psql_cmd() {
	PGPASSWORD="$POSTGRES_PASSWORD" psql \
		-h "$POSTGRES_HOST" \
		-p "${POSTGRES_PORT:-5432}" \
		-U "$POSTGRES_USER" \
		-d "$POSTGRES_DB" \
		-v ON_ERROR_STOP=1 \
		"$@"
}

ensure_registry() {
	psql_cmd <<'SQL'
CREATE SCHEMA IF NOT EXISTS lead_management;

CREATE TABLE IF NOT EXISTS lead_management.schema_migrations (
	version text NOT NULL,
	kind text NOT NULL,
	applied_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (version, kind),
	CONSTRAINT schema_migrations_kind_check CHECK (kind IN ('migration', 'seed'))
);
SQL
}

apply_directory() {
	kind="$1"
	directory="$2"

	if [ ! -d "$directory" ]; then
		echo "Directory $directory not found; skipping $kind."
		return 0
	fi

	found_sql=false

	for file in "$directory"/*.sql; do
		if [ ! -e "$file" ]; then
			continue
		fi

		found_sql=true
		version="$(basename "$file")"
		applied="$(psql_cmd -tAc "SELECT 1 FROM lead_management.schema_migrations WHERE version = '$version' AND kind = '$kind' LIMIT 1;")"

		if [ "$applied" = "1" ]; then
			echo "Skipping $kind $version (already applied)."
			continue
		fi

		echo "Applying $kind $version"
		psql_cmd -f "$file"
		psql_cmd -c "INSERT INTO lead_management.schema_migrations (version, kind) VALUES ('$version', '$kind');"
	done

	if [ "$found_sql" = false ]; then
		echo "No $kind files found in $directory."
	fi
}

ensure_registry
apply_directory migration /migrations
apply_directory seed /seeds

echo "Database bootstrap finished successfully."
