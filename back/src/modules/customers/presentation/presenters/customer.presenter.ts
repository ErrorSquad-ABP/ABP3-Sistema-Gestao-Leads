import type { CustomerResponseDto } from '../../application/dto/customer-response.dto.js';
import type { Customer } from '../../domain/entities/customer.entity.js';

class CustomerPresenter {
	static toResponse(customer: Customer): CustomerResponseDto {
		return {
			id: customer.id.value,
			name: customer.name.value,
			email: customer.email?.value ?? null,
			phone: customer.phone?.value ?? null,
			cpf: customer.cpf?.value ?? null,
		} satisfies CustomerResponseDto;
	}

	static toResponseList(customers: readonly Customer[]): CustomerResponseDto[] {
		return customers.map((c) => CustomerPresenter.toResponse(c));
	}
}

export { CustomerPresenter };
