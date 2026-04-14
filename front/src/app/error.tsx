'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { appRoutes } from '@/lib/routes/app-routes';

type ErrorPageProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

function AppErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<ErrorState
			code={500}
			description="A aplicação encontrou uma falha inesperada ao renderizar este trecho. O restante da plataforma pode continuar disponível em outras rotas."
			eyebrow="Falha inesperada"
			primaryAction={{
				label: 'Tentar novamente',
				onClick: reset,
			}}
			secondaryAction={{
				href: appRoutes.app.root,
				label: 'Voltar ao AppShell',
				variant: 'secondary',
			}}
			technicalDetails={error.digest ?? error.message}
			title="Ocorreu um erro ao processar esta página."
		/>
	);
}

export default AppErrorPage;
