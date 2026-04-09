type SystemSummary = {
	appUrl: string;
	backendPattern: 'modular-monolith';
	endpoints: {
		docs: '/api/docs';
		health: '/api/health';
		v1: '/api/v1';
	};
	infrastructure: {
		databaseClient: 'prisma';
		databaseConfigured: boolean;
		databaseProvider: 'postgresql';
		jwtConfigured: boolean;
	};
	modules: string[];
	name: string;
	nodeEnv: string;
	repositoryStrategy: 'single-repository';
	solutionStyle: 'next-front-nest-back';
	status: 'bootstrapped-with-prisma';
	transport: 'http-json';
};

export type { SystemSummary };
