/** Apenas dígitos, tamanho limitado. */
function digitsOnly(raw: string, maxLength: number): string {
	return raw.replace(/\D/g, '').slice(0, maxLength);
}

function isSafeIntegerInput(n: number): boolean {
	return (
		Number.isFinite(n) &&
		!Number.isNaN(n) &&
		Math.abs(n) <= Number.MAX_SAFE_INTEGER
	);
}

function parseIntStrict(digits: string): number | null {
	if (digits.length === 0) {
		return null;
	}
	const n = Number.parseInt(digits, 10);
	return isSafeIntegerInput(n) ? n : null;
}

/**
 * Não exibe "NaN" no input controlado: só string segura.
 * Aceita `unknown` porque `useWatch` com Zod pode inferir assim.
 */
function formatFiniteIntForInput(value: unknown): string {
	if (value == null) {
		return '';
	}
	if (typeof value !== 'number') {
		return '';
	}
	if (!Number.isFinite(value) || Number.isNaN(value)) {
		return '';
	}
	return String(value);
}

export { digitsOnly, formatFiniteIntForInput, parseIntStrict };
