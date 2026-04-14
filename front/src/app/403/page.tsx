import type { Metadata } from 'next';

import { ErrorState } from '@/components/shared/ErrorState';
import { appRoutes } from '@/lib/routes/app-routes';

const metadata: Metadata = {
	title: 'Acesso negado | Sistema de Gestão de Leads',
	description:
		'Tratamento visual de permissão insuficiente para áreas protegidas do sistema.',
};

function ForbiddenPage() {
	return (
		<ErrorState
			code={403}
			description="A sessão foi reconhecida, mas o papel atual não cobre o destino acessado. O controle final continua no backend e a interface reflete esse bloqueio."
			eyebrow="Acesso negado"
			primaryAction={{
				href: appRoutes.app.root,
				label: 'Voltar ao início autenticado',
			}}
			secondaryAction={{
				href: appRoutes.auth.login,
				label: 'Trocar de conta',
			}}
			title="Você não tem permissão para acessar esta área."
		/>
	);
}

export { metadata };
export default ForbiddenPage;
