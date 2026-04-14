'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { appRoutes } from '@/lib/routes/app-routes';

type GlobalErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="pt-BR">
			<body>
				<ErrorState
					code={500}
					description="A aplicação encontrou uma falha estrutural e não conseguiu concluir o fluxo atual. A interface foi interrompida antes da renderização normal."
					eyebrow="Falha global"
					primaryAction={{
						label: 'Tentar recarregar',
						onClick: reset,
					}}
					secondaryAction={{
						href: appRoutes.root,
						label: 'Voltar à raiz',
						variant: 'secondary',
					}}
					technicalDetails={error.digest ?? error.message}
					title="A aplicação não conseguiu concluir esta operação."
				/>
			</body>
		</html>
	);
}

export default GlobalErrorPage;
