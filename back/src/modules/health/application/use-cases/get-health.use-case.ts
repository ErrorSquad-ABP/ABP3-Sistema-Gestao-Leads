import { Injectable } from '@nestjs/common';

import type { HealthSnapshot } from '../../domain/entities/health-snapshot.js';

@Injectable()
class GetHealthUseCase {
	execute(): HealthSnapshot {
		return {
			runtime: 'nest',
			service: 'back',
			status: 'ok',
			timestamp: new Date().toISOString(),
			transport: 'http-json',
		};
	}
}

export { GetHealthUseCase };
