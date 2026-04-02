import { randomUUID } from 'node:crypto';

import { DomainValidationError } from '../errors/domain-validation.error.js';

/** RFC 4122 UUID versão 4 (variante 1). */
const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Identificador UUID v4 no domínio. Geração via `node:crypto`; persistência como string (`value` / `toString()`).
 */
class Uuid {
	private constructor(private readonly raw: string) {}

	static generate(): Uuid {
		return new Uuid(randomUUID());
	}

	static parse(value: string): Uuid {
		const trimmed = value.trim();
		if (!UUID_V4.test(trimmed)) {
			throw new DomainValidationError('Value must be a valid UUID v4', {
				code: 'uuid.invalid_format',
				context: { value: trimmed },
			});
		}
		return new Uuid(trimmed.toLowerCase());
	}

	static create(value: string): Uuid {
		return Uuid.parse(value);
	}

	get value(): string {
		return this.raw;
	}

	toString(): string {
		return this.raw;
	}

	equals(other: Uuid): boolean {
		return this.raw === other.raw;
	}
}

export { Uuid };
