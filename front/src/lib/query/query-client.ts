import { QueryClient } from '@tanstack/react-query';

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				gcTime: 300_000,
				refetchOnWindowFocus: false,
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

export { createQueryClient };
