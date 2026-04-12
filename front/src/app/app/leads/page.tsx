import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function LeadsHomePage() {
	return (
		<AppRoutePlaceholder
			description="Destino inicial previsto para atendentes apos autenticacao e tambem acessivel aos perfis gerenciais ja liberados pelo layout da rota."
			eyebrow="Leads"
			highlights={[
				'Estrutura pronta para listagem inicial, filtros e acoes do nucleo comercial.',
				'Redirecionamento por papel ja consegue levar o atendente direto para esta area.',
			]}
			nextStep="Implementar a listagem inicial de leads e, em seguida, o fluxo de criacao e edicao."
			title="Meus Leads"
		/>
	);
}

export default LeadsHomePage;
