const env = {
	apiInternalUrl:
		process.env.API_INTERNAL_URL ??
		process.env.NEXT_PUBLIC_API_URL ??
		'http://localhost:3001',
	publicApiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
};

export { env };
