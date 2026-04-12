import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function CustomersPage() {
	return (
		<AppRoutePlaceholder
			description="Area protegida preparada para o cadastro e a manutencao inicial de clientes dentro do shell autenticado da Sprint 1."
			eyebrow="Clientes"
			highlights={[
				'Base pronta para lista, formulario e detalhes sem depender de novo layout.',
				'Modulo ja passa a existir como destino navegavel na area autenticada.',
			]}
			nextStep="Implementar a interface inicial de clientes e conectar os contratos HTTP do modulo."
			title="Clientes"
		/>
	);
}

export default CustomersPage;
