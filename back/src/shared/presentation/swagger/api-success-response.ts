import { applyDecorators, type Type } from '@nestjs/common';
import {
	ApiCreatedResponse,
	ApiExtraModels,
	ApiOkResponse,
	getSchemaPath,
} from '@nestjs/swagger';

type EnvelopeDocOptions = {
	readonly description?: string;
};

/**
 * Schema OpenAPI do corpo JSON real quando {@link ApiResponseInterceptor} está ativo:
 * `{ success, message, data, errors }` com `data` tipado pelo DTO do handler.
 */
function buildSuccessEnvelopeSchema(
	dataProperty: Record<string, unknown>,
): Record<string, unknown> {
	return {
		type: 'object',
		required: ['success', 'message', 'data', 'errors'],
		properties: {
			success: { type: 'boolean', example: true },
			message: { type: 'string', nullable: true, example: null },
			data: dataProperty,
			errors: {
				type: 'array',
				nullable: true,
				example: null,
			},
		},
	};
}

/** `200` — envelope + `data` como instância de `model`. */
function ApiOkResponseEnvelope<T extends Type<unknown>>(
	model: T,
	options?: EnvelopeDocOptions,
) {
	return applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			...(options?.description !== undefined && {
				description: options.description,
			}),
			schema: buildSuccessEnvelopeSchema({
				$ref: getSchemaPath(model),
			}),
		}),
	);
}

/**
 * `200` — envelope com `data` tipado como `model` **ou** `null` (sessão opcional).
 * OpenAPI 3.0: `nullable` + `allOf` + `$ref` (padrão suportado pelo Swagger UI).
 */
function ApiOkResponseEnvelopeNullable<T extends Type<unknown>>(
	model: T,
	options?: EnvelopeDocOptions,
) {
	return applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			...(options?.description !== undefined && {
				description: options.description,
			}),
			schema: buildSuccessEnvelopeSchema({
				nullable: true,
				allOf: [{ $ref: getSchemaPath(model) }],
			}),
		}),
	);
}

/** `200` — envelope + `data` como array de `model`. */
function ApiOkResponseEnvelopeArray<T extends Type<unknown>>(
	model: T,
	options?: EnvelopeDocOptions,
) {
	return applyDecorators(
		ApiExtraModels(model),
		ApiOkResponse({
			...(options?.description !== undefined && {
				description: options.description,
			}),
			schema: buildSuccessEnvelopeSchema({
				type: 'array',
				items: { $ref: getSchemaPath(model) },
			}),
		}),
	);
}

/** `201` — envelope + `data` como instância de `model`. */
function ApiCreatedResponseEnvelope<T extends Type<unknown>>(
	model: T,
	options?: EnvelopeDocOptions,
) {
	return applyDecorators(
		ApiExtraModels(model),
		ApiCreatedResponse({
			...(options?.description !== undefined && {
				description: options.description,
			}),
			schema: buildSuccessEnvelopeSchema({
				$ref: getSchemaPath(model),
			}),
		}),
	);
}

/** `200` — envelope + `data` como página `{ items[], page, limit, total, totalPages }`. */
function ApiOkResponseEnvelopePaged<T extends Type<unknown>>(
	itemModel: T,
	options?: EnvelopeDocOptions,
) {
	return applyDecorators(
		ApiExtraModels(itemModel),
		ApiOkResponse({
			...(options?.description !== undefined && {
				description: options.description,
			}),
			schema: buildSuccessEnvelopeSchema({
				type: 'object',
				required: ['items', 'page', 'limit', 'total', 'totalPages'],
				properties: {
					items: {
						type: 'array',
						items: { $ref: getSchemaPath(itemModel) },
					},
					page: { type: 'integer', minimum: 1, example: 1 },
					limit: { type: 'integer', minimum: 1, example: 20 },
					total: { type: 'integer', minimum: 0, example: 42 },
					totalPages: {
						type: 'integer',
						minimum: 0,
						description:
							'Número de páginas para o `limit` atual; 0 se `total` for 0.',
						example: 3,
					},
				},
			}),
		}),
	);
}

export {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
	ApiOkResponseEnvelopeNullable,
	ApiOkResponseEnvelopePaged,
};
