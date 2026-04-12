import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function OperationalDashboardPage() {
	return (
		<AppRoutePlaceholder
			description="Destino inicial previsto para gerentes apos autenticacao, usando a mesma base protegida e navegavel do restante do modulo."
			eyebrow="Dashboard"
			highlights={[
				'Area pronta para filas, desempenho do time e indicadores de acompanhamento.',
				'Compartilha cabecalho, navegacao lateral e contexto de sessao com os outros modulos.',
			]}
			nextStep="Adicionar visao tatico-operacional sem precisar reconstruir layout ou protecao de rota."
			title="Dashboard Operacional"
		/>
	);
}

export default OperationalDashboardPage;
