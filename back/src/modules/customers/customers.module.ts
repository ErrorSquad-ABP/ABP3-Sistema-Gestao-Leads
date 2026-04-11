import { Module } from '@nestjs/common';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case.js';
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.use-case.js';
import { FindCustomerUseCase } from './application/use-cases/find-customer.use-case.js';
import { ListCustomersUseCase } from './application/use-cases/list-customers.use-case.js';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case.js';
import { CustomerRepositoryFactory } from './infrastructure/persistence/factories/customer-repository.factory.js';
import { CustomerController } from './presentation/controllers/customer.controller.js';

@Module({
	controllers: [CustomerController],
	providers: [
		CustomerRepositoryFactory,
		CreateCustomerUseCase,
		ListCustomersUseCase,
		FindCustomerUseCase,
		UpdateCustomerUseCase,
		DeleteCustomerUseCase,
	],
	exports: [CustomerRepositoryFactory, FindCustomerUseCase],
})
class CustomersModule {}

export { CustomersModule };
