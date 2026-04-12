import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function UsersPage() {
	return (
		<AppRoutePlaceholder
			description="A criacao e gestao de utilizadores passa a acontecer dentro da area administrativa. Esta rota permanece protegida para administrador e agora vive dentro do shell autenticado comum."
			eyebrow="Administracao"
			highlights={[
				'Guarda de papel continua aplicada apenas para ADMINISTRATOR.',
				'Base pronta para tabela, detalhes e formularios de criacao e edicao.',
			]}
			nextStep="Implementar a interface inicial de usuarios em cima do shell protegido e consistente com o modulo."
			title="Gestao de Utilizadores"
		/>
	);
}

export default UsersPage;
