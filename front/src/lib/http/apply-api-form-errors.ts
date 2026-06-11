import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

import { isApiError } from './api-error';
import {
	API_ERROR_CODE_FIELDS,
	getApiErrorCodeField,
	getApiErrorCodeMessage,
} from './api-error-codes';
import { humanizeFormApiError, sanitizeApiMessage } from './humanize-api-error';

function lookupStringRecord(
	record: Readonly<Record<string, string>>,
	key: string,
): string | undefined {
	for (const [recordKey, value] of Object.entries(record)) {
		if (recordKey === key) {
			return value;
		}
	}
	return undefined;
}

function upsertFieldError(
	mapped: Record<string, string>,
	fieldName: string,
	message: string,
): Record<string, string> {
	if (!fieldName || !message) {
		return mapped;
	}

	return Object.fromEntries([
		...Object.entries(mapped).filter(([key]) => key !== fieldName),
		[fieldName, message],
	]);
}

function hasFieldError(
	mapped: Record<string, string>,
	fieldName: string,
): boolean {
	return Object.entries(mapped).some(([key]) => key === fieldName);
}

function mapApiFieldErrors(
	error: unknown,
	fieldMap: Readonly<Record<string, string>> = API_ERROR_CODE_FIELDS,
): Record<string, string> {
	if (!isApiError(error)) {
		return {};
	}

	let mapped: Record<string, string> = {};

	for (const item of error.errors) {
		const detailsField = item.details?.field;
		const fieldName =
			typeof detailsField === 'string'
				? detailsField
				: (lookupStringRecord(fieldMap, item.code) ??
					getApiErrorCodeField(item.code));
		const message =
			getApiErrorCodeMessage(item.code) ?? sanitizeApiMessage(item.message);

		if (fieldName && message) {
			mapped = upsertFieldError(mapped, fieldName, message);
		}
	}

	if (error.code) {
		const fieldName =
			lookupStringRecord(fieldMap, error.code) ??
			getApiErrorCodeField(error.code);
		const message =
			getApiErrorCodeMessage(error.code) ??
			sanitizeApiMessage(error.message);
		if (fieldName && message && !hasFieldError(mapped, fieldName)) {
			mapped = upsertFieldError(mapped, fieldName, message);
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
