import type { Metadata } from 'next';

import { ErrorState } from '@/components/shared/ErrorState';
import { appRoutes } from '@/lib/routes/app-routes';

const metadata: Metadata = {
	title: 'Sessão necessária | Sistema de Gestão de Leads',
	description:
		'Tratamento visual de acesso não autenticado para áreas protegidas do sistema.',
};

function UnauthorizedPage() {
	return (
		<ErrorState
			code={401}
			description="A área solicitada exige uma sessão válida. Faça login novamente para continuar com segurança no fluxo protegido."
			eyebrow="Sessão necessária"
			primaryAction={{
				href: appRoutes.auth.login,
				label: 'Ir para login',
			}}
			secondaryAction={{
				href: appRoutes.root,
				label: 'Voltar ao início',
			}}
			title="Sua sessão não está disponível para acessar esta área."
		/>
	);
}

export { metadata };
export default UnauthorizedPage;
