import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import { LeadAlreadyConvertedError } from '../../../modules/leads/domain/errors/lead-already-converted.error.js';
import { LeadInvalidCustomerError } from '../../../modules/leads/domain/errors/lead-invalid-customer.error.js';
import { LeadInvalidOwnerError } from '../../../modules/leads/domain/errors/lead-invalid-owner.error.js';
import { LeadInvalidStoreError } from '../../../modules/leads/domain/errors/lead-invalid-store.error.js';
import { LeadNotFoundError } from '../../../modules/leads/domain/errors/lead-not-found.error.js';
import { StoreDeleteBlockedError } from '../../../modules/stores/domain/errors/store-delete-blocked.error.js';
import { StoreNotFoundError } from '../../../modules/stores/domain/errors/store-not-found.error.js';
import { TeamInvalidManagerError } from '../../../modules/teams/domain/errors/team-invalid-manager.error.js';
import { TeamAccessDeniedError } from '../../../modules/teams/domain/errors/team-access-denied.error.js';
import { TeamInvalidStoreError } from '../../../modules/teams/domain/errors/team-invalid-store.error.js';
import { TeamNotFoundError } from '../../../modules/teams/domain/errors/team-not-found.error.js';
import { UserEmailAlreadyExistsError } from '../../../modules/users/domain/errors/user-email-already-exists.error.js';
import { UserNotFoundError } from '../../../modules/users/domain/errors/user-not-found.error.js';
import { DomainValidationError } from '../../domain/errors/domain-validation.error.js';
import type {
	ApiErrorEnvelope,
	ApiErrorItem,
} from '../types/api-response.types.js';

/**
 * Mapeia erros de domínio e `HttpException` para o envelope `{ success, message, data, errors }`.
 * Registrado globalmente em `main.ts` via `useGlobalFilters`.
 *
 * Contrato HTTP (domínio → status) — manter alinhado aos casos de uso:
 *
 * | Classe | Status |
 * | --- | --- |
 * | `LeadNotFoundError` | 404 |
 * | `LeadInvalidCustomerError`, `LeadInvalidStoreError`, `LeadInvalidOwnerError` | 400 |
 * | `LeadAlreadyConvertedError` | 409 |
 * | `StoreNotFoundError` | 404 |
 * | `StoreDeleteBlockedError` | 409 |
 * | `TeamNotFoundError` | 404 |
 * | `TeamInvalidManagerError`, `TeamInvalidStoreError` | 400 |
 * | `TeamAccessDeniedError` | 403 |
 * | `UserNotFoundError` | 404 |
 * | `UserEmailAlreadyExistsError` | 409 |
 * | `DomainValidationError` | 400 |
 */
@Catch()
class DomainErrorFilter implements ExceptionFilter {
	private readonly logger = new Logger(DomainErrorFilter.name);

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const envelope = this.httpExceptionToEnvelope(status, exception);
			response.status(status).json(envelope);
			return;
		}

		const mapped = this.mapDomainException(exception);
		if (mapped) {
			response.status(mapped.status).json(mapped.body);
			return;
		}

		const message =
			exception instanceof Error ? exception.message : 'Internal server error';
		this.logger.error(
			exception instanceof Error ? exception.stack : String(exception),
		);
		response
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.json(
				this.toErrorEnvelope(message, [
					{ code: 'internal.server_error', message },
				]),
			);
	}

	private httpExceptionToEnvelope(
		status: number,
		exception: HttpException,
	): ApiErrorEnvelope {
		const body = exception.getResponse();

		if (typeof body === 'string') {
			return this.toErrorEnvelope(body, [
				{ code: `http.${status}`, message: body },
			]);
		}

		if (typeof body === 'object' && body !== null) {
			const r = body as Record<string, unknown>;
			const rawMessage = r.message;

			if (Array.isArray(rawMessage)) {
				const items: ApiErrorItem[] = rawMessage.map((m) => ({
					code: 'validation.failed',
					message: String(m),
				}));
				return this.toErrorEnvelope('Erro de validação', items);
			}

			if (typeof rawMessage === 'string') {
				return this.toErrorEnvelope(rawMessage, [
					{ code: `http.${status}`, message: rawMessage },
				]);
			}

			if (
				typeof r.code === 'string' &&
				(typeof r.message === 'string' || typeof r.message === 'number')
			) {
				const item: ApiErrorItem = {
					code: r.code,
					message: String(r.message),
				};
				if (r.details !== undefined && typeof r.details === 'object') {
					Object.assign(item, {
						details: r.details as Readonly<Record<string, unknown>>,
					});
				}
				return this.toErrorEnvelope(String(r.message), [item]);
			}
		}

		return this.toErrorEnvelope(exception.message, [
			{ code: `http.${status}`, message: exception.message },
		]);
	}

	private envelopeForCodedError(
		exception: { readonly message: string; readonly code: string },
		status: HttpStatus,
	): { status: number; body: ApiErrorEnvelope } {
		return {
			status,
			body: this.toErrorEnvelope(exception.message, [
				{ code: exception.code, message: exception.message },
			]),
		};
	}

	private mapDomainException(
		exception: unknown,
	): { status: number; body: ApiErrorEnvelope } | undefined {
		// --- Leads ---
		if (exception instanceof LeadNotFoundError) {
			return this.envelopeForCodedError(exception, HttpStatus.NOT_FOUND);
		}

		if (
			exception instanceof LeadInvalidCustomerError ||
			exception instanceof LeadInvalidStoreError ||
			exception instanceof LeadInvalidOwnerError
		) {
			return this.envelopeForCodedError(exception, HttpStatus.BAD_REQUEST);
		}

		if (exception instanceof LeadAlreadyConvertedError) {
			return this.envelopeForCodedError(exception, HttpStatus.CONFLICT);
		}

		// --- Stores ---
		if (exception instanceof StoreNotFoundError) {
			return this.envelopeForCodedError(exception, HttpStatus.NOT_FOUND);
		}

		if (exception instanceof StoreDeleteBlockedError) {
			return {
				status: HttpStatus.CONFLICT,
				body: this.toErrorEnvelope(exception.message, [
					{
						code: exception.code,
						message: exception.message,
						details: {
							leads: exception.leads,
							teams: exception.teams,
						},
					},
				]),
			};
		}

		// --- Teams ---
		if (exception instanceof TeamNotFoundError) {
			return this.envelopeForCodedError(exception, HttpStatus.NOT_FOUND);
		}

		if (
			exception instanceof TeamInvalidManagerError ||
			exception instanceof TeamInvalidStoreError
		) {
			return this.envelopeForCodedError(exception, HttpStatus.BAD_REQUEST);
		}

		if (exception instanceof TeamAccessDeniedError) {
			return this.envelopeForCodedError(exception, HttpStatus.FORBIDDEN);
		}

		// --- Users ---
		if (exception instanceof UserNotFoundError) {
			return this.envelopeForCodedError(exception, HttpStatus.NOT_FOUND);
		}

		if (exception instanceof UserEmailAlreadyExistsError) {
			return this.envelopeForCodedError(exception, HttpStatus.CONFLICT);
		}

		if (exception instanceof DomainValidationError) {
			const item: ApiErrorItem = {
				code: exception.code,
				message: exception.message,
			};
			if (exception.context !== undefined) {
				Object.assign(item, {
					details: { ...exception.context } as Readonly<
						Record<string, unknown>
					>,
				});
			}
			return {
				status: HttpStatus.BAD_REQUEST,
				body: this.toErrorEnvelope(exception.message, [item]),
			};
		}

		return undefined;
	}

	private toErrorEnvelope(
		summaryMessage: string,
		errors: readonly ApiErrorItem[],
	): ApiErrorEnvelope {
		return {
			success: false,
			message: summaryMessage,
			data: null,
			errors: [...errors],
		};
	}
}

export { DomainErrorFilter };
