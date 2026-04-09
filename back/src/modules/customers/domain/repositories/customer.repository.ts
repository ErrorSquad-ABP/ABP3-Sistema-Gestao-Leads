import type { UUID } from '../../../../shared/domain/types/identifiers.js';

import type { Customer } from '../entities/customer.entity.js';

/**
 * Persistence port for {@link Customer} (diagram: ICustomerRepository).
 */
interface ICustomerRepository {
	create(customer: Customer): Promise<Customer>;
	update(customer: Customer): Promise<Customer>;
	delete(id: UUID): Promise<void>;
	findById(id: UUID): Promise<Customer | null>;
	findByEmail(email: string): Promise<Customer | null>;
	/** CPF inválido (formato/checksum) lança antes da consulta; não retorna `null` silenciosamente por isso. */
	findByCpf(cpf: string): Promise<Customer | null>;
	list(): Promise<Customer[]>;
}

export type { ICustomerRepository };
