import { CustomerResponseDto } from '../../application/dto/customer-response.dto.js';
import type { Customer } from '../../domain/entities/customer.entity.js';

class CustomerPresenter {
	static toResponse(customer: Customer): CustomerResponseDto {
		const dto = new CustomerResponseDto();
		dto.id = customer.id.value;
		dto.name = customer.name.value;
		dto.email = customer.email?.value ?? null;
		dto.phone = customer.phone?.value ?? null;
		dto.cpf = customer.cpf?.value ?? null;
		return dto;
	}

	static toResponseList(customers: readonly Customer[]): CustomerResponseDto[] {
		return customers.map((customer) => CustomerPresenter.toResponse(customer));
	}
}

export { CustomerPresenter };
