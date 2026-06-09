import type { StoreMetricsResponseDto } from '../../application/dto/store-metrics-response.dto.js';
import type { StoreMetrics } from '../../domain/repositories/store.repository.js';

class StoreMetricsPresenter {
	static toResponse(metrics: StoreMetrics): StoreMetricsResponseDto {
		return { ...metrics } as StoreMetricsResponseDto;
	}

	static toResponseList(metrics: StoreMetrics[]): StoreMetricsResponseDto[] {
		return metrics.map((item) => StoreMetricsPresenter.toResponse(item));
	}
}

export { StoreMetricsPresenter };
