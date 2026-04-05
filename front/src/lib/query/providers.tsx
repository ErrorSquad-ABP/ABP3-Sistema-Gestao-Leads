import type { ReactNode } from 'react';

type QueryProvidersProps = {
	readonly children: ReactNode;
};

function QueryProviders({ children }: QueryProvidersProps) {
	return children;
}

export { QueryProviders };
