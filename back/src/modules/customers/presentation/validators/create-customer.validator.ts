import {
	BadRequestException,
	Injectable,
	type PipeTransform,
} from '@nestjs/common';

type CreateCustomerPayload = {
	name?: unknown;
	email?: unknown;
	phone?: unknown;
	cpf?: unknown;
};

type CreateCustomerValidated = {
	name: string;
	email?: string | null;
	phone?: string | null;
	cpf?: string | null;
};

@Injectable()
class CreateCustomerValidator
	implements PipeTransform<CreateCustomerPayload, CreateCustomerValidated>
{
	transform(value: CreateCustomerPayload) {
		const errors: Record<string, string> = {};

		// Validate name (required)
		if (typeof value.name !== 'string' || !value.name.trim()) {
			errors.name = 'Nome é obrigatório e deve ser uma string.';
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
			name: value.name as string,
			email: value.email ? (value.email as string) : null,
			phone: value.phone ? (value.phone as string) : null,
			cpf: value.cpf ? (value.cpf as string) : null,
		};
	}
}

export type { CreateCustomerPayload, CreateCustomerValidated };
export { CreateCustomerValidator };
