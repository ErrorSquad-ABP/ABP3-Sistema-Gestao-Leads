import type { Metadata } from 'next';

import { ErrorState } from '@/components/shared/ErrorState';
import { appRoutes } from '@/lib/routes/app-routes';

const metadata: Metadata = {
	title: 'Página não encontrada | Sistema de Gestão de Leads',
	description:
		'Tratamento visual de rota inexistente dentro do Sistema de Gestão de Leads.',
};

function NotFoundPage() {
	return (
		<ErrorState
			code={404}
			description="O destino solicitado não foi encontrado no fluxo atual da aplicação. Use a navegação principal para voltar a uma área válida do sistema."
			eyebrow="Página não encontrada"
			primaryAction={{
				href: appRoutes.app.root,
				label: 'Voltar ao AppShell',
			}}
			secondaryAction={{
				href: appRoutes.root,
				label: 'Ir para a raiz',
				variant: 'secondary',
			}}
			title="Não foi possível localizar a página solicitada."
		/>
	);
}

export { metadata };
export default NotFoundPage;
