import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function AnalyticDashboardPage() {
	return (
		<AppRoutePlaceholder
			description="Destino inicial previsto para gerente geral e administrador, agora dentro do shell autenticado compartilhado da Sprint 1."
			eyebrow="Dashboard"
			highlights={[
				'Espaco preparado para indicadores consolidados, filtros e cards executivos.',
				'Base visual unica reduz retrabalho para os paineis das proximas historias.',
			]}
			nextStep="Implementar os widgets e consultas do dashboard analitico sobre esta estrutura protegida."
			title="Dashboard Analitico"
		/>
	);
}

export default AnalyticDashboardPage;
