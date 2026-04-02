import { ApiProperty } from '@nestjs/swagger';

class SystemEndpointsDto {
	@ApiProperty({ example: '/docs' })
	docs!: string;

	@ApiProperty({ example: '/api/health' })
	health!: string;

	@ApiProperty({ example: '/api/v1' })
	v1!: string;
}

class SystemInfrastructureDto {
	@ApiProperty({ example: 'prisma' })
	databaseClient!: string;

	@ApiProperty({ example: true })
	databaseConfigured!: boolean;

	@ApiProperty({ example: 'postgresql' })
	databaseProvider!: string;

	@ApiProperty({ example: true })
	jwtConfigured!: boolean;
}

class SystemSummaryResponseDto {
	@ApiProperty({ example: 'http://localhost:3000' })
	appUrl!: string;

	@ApiProperty({ enum: ['modular-monolith'] })
	backendPattern!: 'modular-monolith';

	@ApiProperty({ type: SystemEndpointsDto })
	endpoints!: SystemEndpointsDto;

	@ApiProperty({ type: SystemInfrastructureDto })
	infrastructure!: SystemInfrastructureDto;

	@ApiProperty({
		type: [String],
		example: [
			'auth',
			'users',
			'teams',
			'stores',
			'customers',
			'leads',
			'negotiations',
			'dashboards',
			'audit-logs',
		],
	})
	modules!: string[];

	@ApiProperty()
	name!: string;

	@ApiProperty({ example: 'development' })
	nodeEnv!: string;

	@ApiProperty({ enum: ['single-repository'] })
	repositoryStrategy!: 'single-repository';

	@ApiProperty({ enum: ['next-front-nest-back'] })
	solutionStyle!: 'next-front-nest-back';

	@ApiProperty({ enum: ['bootstrapped-with-prisma'] })
	status!: 'bootstrapped-with-prisma';

	@ApiProperty({ enum: ['http-json'] })
	transport!: 'http-json';
}

export { SystemSummaryResponseDto };
