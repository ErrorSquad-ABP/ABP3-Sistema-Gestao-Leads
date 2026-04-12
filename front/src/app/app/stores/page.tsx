import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function StoresPage() {
	return (
		<AppRoutePlaceholder
			description="Area protegida preparada para o cadastro e a manutencao inicial de lojas, respeitando a estrutura compartilhada do shell autenticado."
			eyebrow="Administracao"
			highlights={[
				'Espaco pronto para CRUD inicial e vinculacoes com equipes e leads.',
				'Rota base criada para evitar retrabalho na proxima dependencia da sprint.',
			]}
			nextStep="Implementar a interface inicial de lojas sobre a mesma estrutura visual e de navegacao."
			title="Lojas"
		/>
	);
}

export default StoresPage;
