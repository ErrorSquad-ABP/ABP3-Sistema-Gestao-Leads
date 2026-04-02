import { type Type, applyDecorators } from '@nestjs/common';
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

export {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
};
