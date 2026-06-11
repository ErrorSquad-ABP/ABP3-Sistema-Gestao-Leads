import { ZodError } from 'zod';

import { ApiError, isApiError } from './api-error';
import { API_ERROR_CODE_MESSAGES } from './api-error-codes';

const DEFAULT_FALLBACK =
	'Não foi possível concluir a operação agora. Tente novamente em instantes.';

const LOGIN_FALLBACK =
	'Não foi possível concluir o login agora. Tente novamente em instantes.';

const PAGE_FALLBACK =
	'Não foi possível carregar os dados agora. Tente novamente em instantes.';

const GENERIC_SERVER_ERROR =
	'Ocorreu um erro inesperado. Tente novamente em instantes.';

const SERVICE_UNAVAILABLE =
	'Serviço temporariamente indisponível. Tente novamente em instantes.';

const NETWORK_UNREACHABLE =
	'Não foi possível ligar ao servidor. Verifique a sua ligação e tente novamente.';

const REQUEST_TIMEOUT =
	'A requisição demorou demais. Verifique a sua ligação e tente novamente.';

const PERMISSION_DENIED = 'O seu perfil não tem permissão para esta operação.';

const NOT_FOUND = 'Registo não encontrado.';

const CONFLICT =
	'Conflito: o registo já existe ou não pode ser removido (existem vínculos).';

const VALIDATION_FAILED =
	'Os dados informados não passaram na validação. Revise os campos e tente novamente.';

const INVALID_CREDENTIALS =
	'Credenciais inválidas. Verifique o e-mail e a senha informados.';

const RATE_LIMITED =
	'Muitas tentativas em sequência. Aguarde um momento antes de tentar novamente.';

type HumanizeApiErrorContext = 'login' | 'modal' | 'page';

type HumanizeApiErrorOptions = {
	readonly context?: HumanizeApiErrorContext;
	readonly fallback?: string;
};

function isTechnicalApiMessage(message: string): boolean {
	const normalized = message.toLowerCase();
	return (
		normalized.includes('invalid `') ||
		normalized.includes('prisma') ||
		normalized.includes('invocation in') ||
		normalized.includes('does not exist in the current database') ||
		normalized.includes('/app/back/') ||
		normalized.includes('api request failed with status') ||
		/\.tsx?:\d+/.test(message) ||
		normalized.includes('prismaclient') ||
		normalized.includes('internal server error') ||
		normalized.includes('unhandled') ||
		normalized.includes('stack') ||
		normalized.includes('not found:') ||
		normalized.includes('already exists:') ||
		normalized.includes('customer email already exists') ||
		normalized.includes('customer cpf already exists') ||
		normalized.includes('user email already exists') ||
		normalized.includes('deal not found') ||
		normalized.includes('lead not found') ||
		normalized.includes('store not found') ||
		normalized.includes('team with id')
	);
}

function sanitizeApiMessage(message: string | undefined): string | null {
	if (message === undefined || message.trim().length === 0) {
		return null;
	}
	if (isTechnicalApiMessage(message)) {
		return null;
	}
	return message;
}

function resolveFallback(options?: HumanizeApiErrorOptions): string {
	if (options?.fallback !== undefined) {
		return options.fallback;
	}
	if (options?.context === 'login') {
		return LOGIN_FALLBACK;
	}
	if (options?.context === 'page') {
		return PAGE_FALLBACK;
	}
	return DEFAULT_FALLBACK;
}

function resolveKnownApiErrorCode(error: ApiError): string | null {
	const candidates = [
		error.code,
		...error.errors.map((item) => item.code),
	].filter(
		(code): code is string => typeof code === 'string' && code.length > 0,
	);

	for (const code of candidates) {
		const mapped = API_ERROR_CODE_MESSAGES[code];
		if (mapped) {
			return mapped;
		}
	}

	return null;
}

function humanizeApiError(
	error: unknown,
	options?: HumanizeApiErrorOptions,
): string {
	const fallback = resolveFallback(options);

	if (!isApiError(error)) {
		return fallback;
	}

	if (error.code === 'network.unreachable') {
		return NETWORK_UNREACHABLE;
	}

	if (error.code === 'request.timeout' || error.status === 408) {
		return REQUEST_TIMEOUT;
	}

	if (error.status === 401) {
		if (options?.context === 'login') {
			return INVALID_CREDENTIALS;
		}
		const message =
			resolveKnownApiErrorCode(error) ?? sanitizeApiMessage(error.message);
		return message ?? 'Sessão inválida ou expirada. Autentique-se novamente.';
	}

	const knownCodeMessage = resolveKnownApiErrorCode(error);
	if (knownCodeMessage) {
		return knownCodeMessage;
	}

	if (error.status === 403) {
		return sanitizeApiMessage(error.message) ?? PERMISSION_DENIED;
	}

	if (error.status === 404) {
		return sanitizeApiMessage(error.message) ?? NOT_FOUND;
	}

	if (error.status === 409) {
		return sanitizeApiMessage(error.message) ?? CONFLICT;
	}

	if (error.status === 400 || error.status === 422) {
		const fieldMessage = error.errors.find(
			(item) => item.message.trim().length > 0,
		)?.message;
		return (
			sanitizeApiMessage(fieldMessage) ??
			sanitizeApiMessage(error.message) ??
			VALIDATION_FAILED
		);
	}

	if (error.status === 429) {
		return sanitizeApiMessage(error.message) ?? RATE_LIMITED;
	}

	if (error.status === 503 || error.code === 'database.unavailable') {
		return sanitizeApiMessage(error.message) ?? SERVICE_UNAVAILABLE;
	}

	if (error.status >= 500) {
		return sanitizeApiMessage(error.message) ?? GENERIC_SERVER_ERROR;
	}

	return sanitizeApiMessage(error.message) ?? fallback;
}

function humanizeFormApiError(
	error: unknown,
	options?: Omit<HumanizeApiErrorOptions, 'context'>,
): string {
	if (error instanceof ZodError) {
		return error.issues[0]?.message ?? VALIDATION_FAILED;
	}

	return humanizeApiError(error, {
		...options,
		context: 'modal',
	});
}

function humanizePageApiError(error: unknown): string {
	return humanizeApiError(error, { context: 'page' });
}

export type { HumanizeApiErrorContext, HumanizeApiErrorOptions };
export {
	GENERIC_SERVER_ERROR,
	humanizeApiError,
	humanizeFormApiError,
	humanizePageApiError,
	isTechnicalApiMessage,
	sanitizeApiMessage,
};
