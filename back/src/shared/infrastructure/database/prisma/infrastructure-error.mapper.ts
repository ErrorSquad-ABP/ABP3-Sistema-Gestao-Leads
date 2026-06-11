import { HttpStatus } from '@nestjs/common';

import { Prisma } from '../../../../generated/prisma/client.js';
import type {
	ApiErrorEnvelope,
	ApiErrorItem,
} from '../../../presentation/types/api-response.types.js';

const INFRASTRUCTURE_UNAVAILABLE_MESSAGE =
	'Serviço temporariamente indisponível. Tente novamente em instantes.';

const DATABASE_CONNECTION_MESSAGE =
	'Não foi possível ligar ao servidor de dados. Tente novamente em instantes.';

const GENERIC_INTERNAL_ERROR_MESSAGE =
	'Ocorreu um erro inesperado. Tente novamente em instantes.';

function toInfrastructureEnvelope(
	status: HttpStatus,
	code: string,
	message: string,
): { readonly status: number; readonly body: ApiErrorEnvelope } {
	const item: ApiErrorItem = { code, message };
	return {
		status,
		body: {
			success: false,
			message,
			data: null,
			errors: [item],
		},
	};
}

function mapPrismaKnownRequestError(
	error: Prisma.PrismaClientKnownRequestError,
): { readonly status: number; readonly body: ApiErrorEnvelope } | undefined {
	switch (error.code) {
		case 'P1000':
		case 'P1001':
		case 'P1002':
		case 'P1008':
		case 'P1017':
			return toInfrastructureEnvelope(
				HttpStatus.SERVICE_UNAVAILABLE,
				'database.unavailable',
				DATABASE_CONNECTION_MESSAGE,
			);
		case 'P2021':
		case 'P2022':
			return toInfrastructureEnvelope(
				HttpStatus.SERVICE_UNAVAILABLE,
				'database.schema_outdated',
				INFRASTRUCTURE_UNAVAILABLE_MESSAGE,
			);
		default:
			return undefined;
	}
}

function looksLikeTechnicalInfrastructureMessage(message: string): boolean {
	const normalized = message.toLowerCase();
	return (
		normalized.includes('invalid `') ||
		normalized.includes('prisma') ||
		normalized.includes('invocation in') ||
		normalized.includes('does not exist in the current database') ||
		normalized.includes('/app/back/') ||
		/\.tsx?:\d+/.test(message) ||
		normalized.includes('prismaclient')
	);
}

function mapInfrastructureException(
	exception: unknown,
): { readonly status: number; readonly body: ApiErrorEnvelope } | undefined {
	if (exception instanceof Prisma.PrismaClientKnownRequestError) {
		return mapPrismaKnownRequestError(exception);
	}

	if (
		exception instanceof Prisma.PrismaClientInitializationError ||
		exception instanceof Prisma.PrismaClientRustPanicError ||
		exception instanceof Prisma.PrismaClientUnknownRequestError
	) {
		return toInfrastructureEnvelope(
			HttpStatus.SERVICE_UNAVAILABLE,
			'database.unavailable',
			DATABASE_CONNECTION_MESSAGE,
		);
	}

	if (exception instanceof Error) {
		if (looksLikeTechnicalInfrastructureMessage(exception.message)) {
			return toInfrastructureEnvelope(
				HttpStatus.INTERNAL_SERVER_ERROR,
				'internal.server_error',
				GENERIC_INTERNAL_ERROR_MESSAGE,
			);
		}
	}

	return undefined;
}

export {
	DATABASE_CONNECTION_MESSAGE,
	GENERIC_INTERNAL_ERROR_MESSAGE,
	INFRASTRUCTURE_UNAVAILABLE_MESSAGE,
	mapInfrastructureException,
};
