import { DomainValidationError } from '../errors/domain-validation.error.js';

/**
 * Brazilian CPF (Cadastro de Pessoa Física) as an 11-digit normalized value.
 */
class Cpf {
	private readonly _digits: string;

	private constructor(digits: string) {
		this._digits = digits;
	}

	static create(value: string): Cpf {
		const digits = value.replace(/\D/g, '');

		if (digits.length !== 11) {
			throw new DomainValidationError('CPF must have exactly 11 digits', {
				code: 'cpf.invalid_length',
			});
		}

		if (/^(\d)\1{10}$/.test(digits)) {
			throw new DomainValidationError('CPF must not be a repeated sequence', {
				code: 'cpf.invalid_pattern',
			});
		}

		if (!Cpf.hasValidCheckDigits(digits)) {
			throw new DomainValidationError('CPF check digits are invalid', {
				code: 'cpf.invalid_checksum',
			});
		}

		return new Cpf(digits);
	}

	static from(value: string): Cpf {
		return Cpf.create(value);
	}

	get value(): string {
		return this._digits;
	}

	equals(other: Cpf): boolean {
		return this._digits === other._digits;
	}

	toString(): string {
		return this._digits;
	}

	private static hasValidCheckDigits(digits: string): boolean {
		const digit = (i: number): number => Number.parseInt(digits.charAt(i), 10);

		let sum = 0;
		for (let i = 0; i < 9; i++) {
			sum += digit(i) * (10 - i);
		}
		let first = (sum * 10) % 11;
		if (first === 10) {
			first = 0;
		}
		if (first !== digit(9)) {
			return false;
		}

		sum = 0;
		for (let i = 0; i < 10; i++) {
			sum += digit(i) * (11 - i);
		}
		let second = (sum * 10) % 11;
		if (second === 10) {
			second = 0;
		}
		return second === digit(10);
	}
}

export { Cpf };
