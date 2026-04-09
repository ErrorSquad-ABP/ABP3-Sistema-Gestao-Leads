import { DomainValidationError } from '../errors/domain-validation.error.js';

const ALLOWED_LEAD_SOURCES = [
	'store-visit',
	'phone-call',
	'whatsapp',
	'instagram',
	'digital-form',
	'other',
] as const;

type LeadSourceValue = (typeof ALLOWED_LEAD_SOURCES)[number];
const ALLOWED_LEAD_SOURCES_SET = new Set<string>(ALLOWED_LEAD_SOURCES);

class LeadSource {
	private readonly _value: LeadSourceValue;

	private constructor(value: LeadSourceValue) {
		this._value = value;
	}

	static create(value: string): LeadSource {
		const normalized = value.trim().toLowerCase();

		if (!LeadSource.isLeadSourceValue(normalized)) {
			throw new DomainValidationError(
				`Lead source must be one of: ${ALLOWED_LEAD_SOURCES.join(', ')}`,
				{
					code: 'lead_source.invalid_value',
					context: { allowedValues: ALLOWED_LEAD_SOURCES.join(', ') },
				},
			);
		}

		return new LeadSource(normalized);
	}

	static from(value: string): LeadSource {
		return LeadSource.create(value);
	}

	get value(): LeadSourceValue {
		return this._value;
	}

	equals(other: LeadSource): boolean {
		return this._value === other.value;
	}

	toString(): string {
		return this._value;
	}

	private static isLeadSourceValue(value: string): value is LeadSourceValue {
		return ALLOWED_LEAD_SOURCES_SET.has(value);
	}
}

export type { LeadSourceValue };
export { ALLOWED_LEAD_SOURCES, LeadSource };
