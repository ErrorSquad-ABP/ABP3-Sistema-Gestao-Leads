import {
	MAX_MONEY_CENTS,
	MONEY_CENTS_STRING_MAX_LEN,
} from '@/lib/money-brl-limits';

function sanitizeMoneyDigitsInput(raw: string): string {
	return raw.replace(/\D/g, '').slice(0, MONEY_CENTS_STRING_MAX_LEN);
}

function formatCentsDigitsToBrlDisplay(digits: string): string {
	if (digits.length === 0) {
		return '';
	}
	const cents = Number.parseInt(digits, 10);
	if (!Number.isFinite(cents) || cents < 0) {
		return '';
	}
	const reais = cents / 100;
	return reais.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
}

function centsDigitsToApiDecimalString(digits: string): string | null {
	if (digits.length === 0) {
		return null;
	}
	const cents = Number.parseInt(digits, 10);
	if (!Number.isFinite(cents) || cents < 0) {
		return null;
	}
	if (cents > MAX_MONEY_CENTS) {
		return null;
	}
	const intPart = Math.floor(cents / 100);
	const frac = (cents % 100).toString().padStart(2, '0');
	return `${intPart}.${frac}`;
}

function apiDecimalStringToCentsDigits(api: string | null | undefined): string {
	if (api === null || api === undefined) {
		return '';
	}
	const trimmed = api.trim();
	if (trimmed.length === 0) {
		return '';
	}
	const m = /^(\d+)\.(\d{1,2})$/.exec(trimmed);
	if (m) {
		const intPart = m[1];
		const dec = `${m[2]}00`.slice(0, 2);
		const cents = Number.parseInt(intPart, 10) * 100 + Number.parseInt(dec, 10);
		return String(cents);
	}
	const n = Number.parseFloat(trimmed);
	if (!Number.isFinite(n) || n < 0) {
		return '';
	}
	return String(Math.round(n * 100));
}

export {
	apiDecimalStringToCentsDigits,
	centsDigitsToApiDecimalString,
	formatCentsDigitsToBrlDisplay,
	sanitizeMoneyDigitsInput,
};
