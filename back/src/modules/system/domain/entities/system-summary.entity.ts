type SystemSummary = {
	appUrl: string;
	backendPattern: 'modular-monolith';
	endpoints: {
		docs: '/docs';
		health: '/api/health';
		v1: '/api/v1';
	};
	infrastructure: {
		databaseConfigured: boolean;
		jwtConfigured: boolean;
	};
	modules: string[];
	name: string;
	nodeEnv: string;
	repositoryStrategy: 'single-repository';
	solutionStyle: 'next-front-nest-back';
	status: 'bootstrapped';
	transport: 'http-json';
};

export type { SystemSummary };
