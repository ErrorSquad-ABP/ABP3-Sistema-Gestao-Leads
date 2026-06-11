import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

import { ApiError, isApiError } from './api-error';
import {
	API_ERROR_CODE_FIELDS,
	API_ERROR_CODE_MESSAGES,
} from './api-error-codes';
import {
	humanizeFormApiError,
	sanitizeApiMessage,
} from './humanize-api-error';

function mapApiFieldErrors(
	error: unknown,
	fieldMap: Readonly<Record<string, string>> = API_ERROR_CODE_FIELDS,
): Record<string, string> {
	if (!isApiError(error)) {
		return {};
	}

	const mapped: Record<string, string> = {};

	for (const item of error.errors) {
		const detailsField = item.details?.field;
		const fieldName =
			typeof detailsField === 'string'
				? detailsField
				: fieldMap[item.code];
		const message =
			API_ERROR_CODE_MESSAGES[item.code] ??
			sanitizeApiMessage(item.message);

		if (fieldName && message) {
			mapped[fieldName] = message;
		}
	}

	if (error.code) {
		const fieldName = fieldMap[error.code];
		const message =
			API_ERROR_CODE_MESSAGES[error.code] ??
			sanitizeApiMessage(error.message);
		if (fieldName && message && mapped[fieldName] === undefined) {
			mapped[fieldName] = message;
		}
	}

	return mapped;
}

function applyApiFormErrors<TFieldValues extends FieldValues>(
	setError: UseFormSetError<TFieldValues>,
	error: unknown,
	fieldMap?: Readonly<Record<string, string>>,
): boolean {
	const fieldErrors = mapApiFieldErrors(error, fieldMap);
	const entries = Object.entries(fieldErrors);

	if (entries.length === 0) {
		return false;
	}

	for (const [fieldName, message] of entries) {
		setError(fieldName as FieldPath<TFieldValues>, {
			type: 'server',
			message,
		});
	}

	return true;
}

function hasApiFieldErrors(error: unknown): boolean {
	return Object.keys(mapApiFieldErrors(error)).length > 0;
}

function resolveFormSubmitError(
	error: unknown,
	options?: Parameters<typeof humanizeFormApiError>[1],
): string | null {
	return hasApiFieldErrors(error) ? null : humanizeFormApiError(error, options);
}

function applyFormSubmitErrors<TFieldValues extends FieldValues>(
	setError: UseFormSetError<TFieldValues>,
	error: unknown,
	fieldMap?: Readonly<Record<string, string>>,
): string | null {
	applyApiFormErrors(setError, error, fieldMap);
	return resolveFormSubmitError(error);
}

export {
	applyApiFormErrors,
	applyFormSubmitErrors,
	hasApiFieldErrors,
	mapApiFieldErrors,
	resolveFormSubmitError,
};
