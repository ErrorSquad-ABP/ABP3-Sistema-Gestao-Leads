import { Module } from '@nestjs/common';

import { ListCustomersUseCase } from './application/use-cases/list-customers.use-case.js';
import { CustomerRepositoryFactory } from './infrastructure/persistence/factories/customer-repository.factory.js';
import { CustomerController } from './presentation/controllers/customer.controller.js';

@Module({
	controllers: [CustomerController],
	providers: [CustomerRepositoryFactory, ListCustomersUseCase],
})
class CustomersModule {}

export { CustomersModule };
