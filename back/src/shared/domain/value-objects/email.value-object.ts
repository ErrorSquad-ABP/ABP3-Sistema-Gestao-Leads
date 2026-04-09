import { DomainValidationError } from '../errors/domain-validation.error.js';

class Email {
	private static readonly LOCAL_PART_REGEX =
		/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}$/;
	private static readonly DOMAIN_LABEL_REGEX = /^[a-z0-9-]{1,63}$/;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	static create(value: string): Email {
		const normalized = value.trim().toLowerCase();

		if (normalized.length > 254) {
			throw new DomainValidationError(
				'Email must contain at most 254 characters',
				{
					code: 'email.too_long',
					context: { maxLength: 254 },
				},
			);
		}

		if (!Email.isValid(normalized)) {
			throw new DomainValidationError('Email must be a valid address', {
				code: 'email.invalid_format',
			});
		}

		return new Email(normalized);
	}

	static from(value: string): Email {
		return Email.create(value);
	}

	get value(): string {
		return this._value;
	}

	equals(other: Email): boolean {
		return this._value === other.value;
	}

	toString(): string {
		return this._value;
	}

	private static isValid(value: string): boolean {
		const atIndex = value.indexOf('@');

		if (atIndex <= 0 || atIndex !== value.lastIndexOf('@')) {
			return false;
		}

		const localPart = value.slice(0, atIndex);
		const domainPart = value.slice(atIndex + 1);

		if (!Email.LOCAL_PART_REGEX.test(localPart)) {
			return false;
		}

		if (!Email.hasValidLocalPartStructure(localPart)) {
			return false;
		}

		if (
			domainPart.length < 3 ||
			domainPart.startsWith('.') ||
			domainPart.endsWith('.')
		) {
			return false;
		}

		const domainLabels = domainPart.split('.');

		if (domainLabels.length < 2) {
			return false;
		}

		const hasValidLabels = domainLabels.every((label) => {
			if (!Email.DOMAIN_LABEL_REGEX.test(label)) {
				return false;
			}

			const startsOrEndsWithDash = label.startsWith('-') || label.endsWith('-');

			if (startsOrEndsWithDash) {
				return false;
			}

			return true;
		});

		if (!hasValidLabels) {
			return false;
		}

		const topLevelDomain = domainLabels[domainLabels.length - 1] ?? '';

		return topLevelDomain.length >= 2;
	}

	private static hasValidLocalPartStructure(localPart: string): boolean {
		if (localPart.startsWith('.') || localPart.endsWith('.')) {
			return false;
		}

		return !localPart.includes('..');
	}
}

export { Email };
