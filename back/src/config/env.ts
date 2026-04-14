import { config as loadDotenv } from 'dotenv';

function loadEnvironmentFiles(): void {
	loadDotenv({ path: '.env' });
	loadDotenv({ override: true, path: '.env.local' });
}

loadEnvironmentFiles();

const env = {
	appUrl: process.env.APP_URL ?? 'http://localhost:3001',
	databaseUrl: process.env.DATABASE_URL ?? '',
	hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
	/** Segredo para validar JWT Bearer; fallback apenas para desenvolvimento local. */
	jwtSecret: process.env.JWT_SECRET ?? '',
	hasJwtSecret: Boolean(process.env.JWT_SECRET),
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number.parseInt(process.env.PORT ?? '3001', 10),
};

export { env };
