function getHealth() {
	return {
		runtime: 'next-api',
		service: 'back',
		status: 'ok',
		timestamp: new Date().toISOString(),
		transport: 'http-json',
	};
}

export { getHealth };
