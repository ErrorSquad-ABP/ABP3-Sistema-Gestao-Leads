const env = {
	appUrl: process.env.APP_URL ?? 'http://localhost:3001',
	hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
	hasJwtSecret: Boolean(process.env.JWT_SECRET),
	nodeEnv: process.env.NODE_ENV ?? 'development',
	port: Number.parseInt(process.env.PORT ?? '3001', 10),
};

export { env };
