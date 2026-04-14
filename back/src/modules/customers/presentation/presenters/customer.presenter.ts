import type { Customer } from '../../domain/entities/customer.entity.js';
import type { CustomerResponseDto } from '../../application/dto/customer-response.dto.js';

class CustomerPresenter {
	static toResponse(customer: Customer): CustomerResponseDto {
		return {
			id: customer.id.value,
			name: customer.name.value,
			email: customer.email?.value ?? null,
			phone: customer.phone?.value ?? null,
			cpf: customer.cpf?.value ?? null,
		};
	}

	static toResponseMany(customers: Customer[]): CustomerResponseDto[] {
		return customers.map((customer) => CustomerPresenter.toResponse(customer));
	}
}

export { CustomerPresenter };
