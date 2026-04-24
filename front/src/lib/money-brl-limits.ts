/**
 * Limite alinhado a `@db.Decimal(12, 2)` no Prisma (veículo e negociação).
 * Máximo: 9.999.999.999,99 BRL (mais do que qualquer preço de veículo de mercado,
 * e evita overflow de coluna e NaN com valores absurdos).
 */
const MAX_MONEY_CENTS = 999_999_999_999;
const MONEY_CENTS_STRING_MAX_LEN = 12;

const MONEY_BRL_EXCEEDS_DB_LIMIT =
	'Valor acima do limite permitido (máx. 9.999.999.999,99, conforme o cadastro).';

/**
 * `45000.00` → centavos (número seguro; máximo 999_999_999_999).
 */
function parseBrlApiDecimalStringToCents(s: string): number {
	const t = s.trim();
	const m = /^(\d+)\.(\d{1,2})$/.exec(t);
	if (!m) {
		return -1;
	}
	const dec = `${m[2]}00`.slice(0, 2);
	return Number.parseInt(m[1], 10) * 100 + Number.parseInt(dec, 10);
}

function isBrlApiDecimalAtOrUnderDbMax(s: string | null | undefined): boolean {
	if (s == null || s === undefined || s === '') {
		return true;
	}
	const cents = parseBrlApiDecimalStringToCents(s);
	if (cents < 0) {
		return true;
	}
	return cents <= MAX_MONEY_CENTS;
}

export {
	isBrlApiDecimalAtOrUnderDbMax,
	MONEY_BRL_EXCEEDS_DB_LIMIT,
	MONEY_CENTS_STRING_MAX_LEN,
	MAX_MONEY_CENTS,
	parseBrlApiDecimalStringToCents,
};
