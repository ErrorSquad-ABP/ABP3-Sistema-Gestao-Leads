import { apiClient } from '@/src/lib/http/api-client';

import { parseCustomerList } from '../schemas/customer.schema';

const customersResource = apiClient.createHttpResource('/customers');

const customersService = {
	list() {
		return customersResource.list(parseCustomerList);
	},
};

export { customersService };
