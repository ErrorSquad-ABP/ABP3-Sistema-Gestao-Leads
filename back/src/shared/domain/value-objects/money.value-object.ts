import { BRL, dinero } from 'dinero.js';

import { DomainValidationError } from '../errors/domain-validation.error.js';

/**
 * Money value object for BRL with 2 decimals (cents).
 *
 * Domain format: integer amount in cents.
 * Persistence/API format: decimal string with 2 digits (e.g. "45000.00").
 */
class Money {
	private constructor(private readonly _cents: number) {}

	static fromDecimalString(value: string): Money {
		const trimmed = value.trim();
		if (trimmed.length === 0) {
			throw new DomainValidationError('Money must be a decimal string', {
				code: 'money.invalid_format',
				context: { value: trimmed },
			});
		}

		// Avoid regex here to keep eslint-security happy and keep parsing deterministic.
		for (let i = 0; i < trimmed.length; i += 1) {
			const ch = trimmed.charAt(i);
			const isDigit = ch >= '0' && ch <= '9';
			const isDot = ch === '.';
			const isMinus = ch === '-' && i === 0;
			if (!isDigit && !isDot && !isMinus) {
				throw new DomainValidationError('Money must be a decimal string', {
					code: 'money.invalid_format',
					context: { value: trimmed },
				});
			}
		}

		const dotCount = [...trimmed].filter((c) => c === '.').length;
		if (dotCount > 1) {
			throw new DomainValidationError('Money must be a decimal string', {
				code: 'money.invalid_format',
				context: { value: trimmed },
			});
		}

		const isNegative = trimmed.startsWith('-');
		if (isNegative) {
			throw new DomainValidationError('Money must be non-negative', {
				code: 'money.negative_not_allowed',
				context: { value: trimmed },
			});
		}

		const unsigned = trimmed.startsWith('-') ? trimmed.slice(1) : trimmed;
		const parts = unsigned.split('.');
		const intPart = parts[0] ?? '0';
		const fracPartRaw = parts[1];
		if (fracPartRaw !== undefined && fracPartRaw.length > 2) {
			throw new DomainValidationError('Money must be a decimal string', {
				code: 'money.invalid_format',
				context: { value: trimmed },
			});
		}
		const fracPart = (fracPartRaw ?? '').padEnd(2, '0');
		const cents =
			Number.parseInt(intPart, 10) * 100 + Number.parseInt(fracPart, 10);
		if (!Number.isFinite(cents) || Number.isNaN(cents)) {
			throw new DomainValidationError('Money must be a finite number', {
				code: 'money.invalid_number',
				context: { value: trimmed },
			});
		}

		return new Money(cents);
	}

	static fromNullableDecimalString(value: string | null): Money | null {
		if (value === null) {
			return null;
		}
		return Money.fromDecimalString(value);
	}

	static fromCents(cents: number): Money {
		if (!Number.isInteger(cents) || cents < 0) {
			throw new DomainValidationError(
				'Money cents must be a non-negative integer',
				{
					code: 'money.invalid_cents',
					context: { cents: Number.isFinite(cents) ? cents : -1 },
				},
			);
		}
		return new Money(cents);
	}

	get cents(): number {
		return this._cents;
	}

	toDecimalString(): string {
		const intPart = Math.floor(this._cents / 100);
		const frac = (this._cents % 100).toString().padStart(2, '0');
		return `${intPart}.${frac}`;
	}

	toDinero() {
		return dinero({ amount: this._cents, currency: BRL });
	}

	equals(other: Money): boolean {
		return this.cents === other.cents;
	}
}

export { Money };
