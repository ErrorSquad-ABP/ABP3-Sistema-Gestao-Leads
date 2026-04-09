import {
	type CallHandler,
	type ExecutionContext,
	HttpStatus,
	Injectable,
	type NestInterceptor,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: necessário em runtime para metadata de DI (Nest)
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { ApiSuccessEnvelope } from '../types/api-response.types.js';

/** Metadado aplicado por `@HttpCode` (equivalente a `HTTP_CODE_METADATA` do Nest). */
const HTTP_CODE_METADATA_KEY = '__httpCode__';

/**
 * Envelopa respostas JSON de sucesso em `{ success, message, data, errors }`.
 * Rotas com `@HttpCode(204)` não são alteradas (corpo vazio).
 */
@Injectable()
class ApiResponseInterceptor implements NestInterceptor {
	constructor(private readonly reflector: Reflector) {}

	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<ApiSuccessEnvelope<unknown> | unknown> {
		const httpCode = this.reflector.getAllAndOverride<number>(
			HTTP_CODE_METADATA_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (httpCode === HttpStatus.NO_CONTENT) {
			return next.handle();
		}

		return next.handle().pipe(
			map((data: unknown) => {
				const envelope: ApiSuccessEnvelope<unknown> = {
					success: true,
					message: null,
					data: data === undefined ? null : data,
					errors: null,
				};
				return envelope;
			}),
		);
	}
}

export { ApiResponseInterceptor };
