import type { CustomerSummary } from '../types/customers.types';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseCustomer(value: unknown): CustomerSummary {
	if (!isRecord(value)) {
		throw new TypeError('Contrato HTTP inválido para customer.');
	}

	return {
		id: String(value.id),
		name: String(value.name),
		email:
			value.email === null || value.email === undefined
				? null
				: String(value.email),
		phone:
			value.phone === null || value.phone === undefined
				? null
				: String(value.phone),
		cpf:
			value.cpf === null || value.cpf === undefined ? null : String(value.cpf),
	};
}

function parseCustomerList(value: unknown): CustomerSummary[] {
	if (!Array.isArray(value)) {
		throw new TypeError('Contrato HTTP inválido para lista de customers.');
	}

	return value.map(parseCustomer);
}

export { parseCustomer, parseCustomerList };
