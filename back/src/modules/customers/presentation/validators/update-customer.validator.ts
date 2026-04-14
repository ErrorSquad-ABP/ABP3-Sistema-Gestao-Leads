import {
	BadRequestException,
	Injectable,
	type PipeTransform,
} from '@nestjs/common';

type UpdateCustomerPayload = {
	name?: unknown;
	email?: unknown;
	phone?: unknown;
	cpf?: unknown;
};

type UpdateCustomerValidated = {
	name?: string;
	email?: string | null;
	phone?: string | null;
	cpf?: string | null;
};

@Injectable()
class UpdateCustomerValidator
	implements PipeTransform<UpdateCustomerPayload, UpdateCustomerValidated>
{
	transform(value: UpdateCustomerPayload) {
		const errors: Record<string, string> = {};

		// Validate name (optional)
		if (value.name !== undefined) {
			if (typeof value.name !== 'string' || !value.name.trim()) {
				errors.name = 'Nome deve ser uma string não vazia.';
			}
		}

		// Validate email (optional, but must be valid if provided)
		if (value.email !== undefined && value.email !== null) {
			if (typeof value.email !== 'string') {
				errors.email = 'Email deve ser uma string.';
			} else if (!value.email.includes('@') || !value.email.includes('.')) {
				errors.email = 'Email inválido.';
			}
		}

		// Validate phone (optional)
		if (value.phone !== undefined && value.phone !== null) {
			if (typeof value.phone !== 'string') {
				errors.phone = 'Telefone deve ser uma string.';
			}
		}

		// Validate cpf (optional)
		if (value.cpf !== undefined && value.cpf !== null) {
			if (typeof value.cpf !== 'string') {
				errors.cpf = 'CPF deve ser uma string.';
			}
		}

		if (Object.keys(errors).length > 0) {
			throw new BadRequestException({
				message: 'Validação falhou',
				errors,
			});
		}

		return {
			name: value.name ? (value.name as string) : undefined,
			email: value.email
				? (value.email as string)
				: value.email === null
					? null
					: undefined,
			phone: value.phone
				? (value.phone as string)
				: value.phone === null
					? null
					: undefined,
			cpf: value.cpf
				? (value.cpf as string)
				: value.cpf === null
					? null
					: undefined,
		};
	}
}

export type { UpdateCustomerPayload, UpdateCustomerValidated };
export { UpdateCustomerValidator };
