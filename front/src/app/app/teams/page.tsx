import { AppRoutePlaceholder } from '@/components/shared/AppRoutePlaceholder';

function TeamsPage() {
	return (
		<AppRoutePlaceholder
			description="Area protegida preparada para a gestao inicial de equipes, com shell compartilhado e navegacao pronta para a proxima fatia."
			eyebrow="Administracao"
			highlights={[
				'Base pronta para CRUD inicial de equipes e futuros vinculos organizacionais.',
				'Modulo ja acessivel dentro da area protegida sem cair em rota inexistente.',
			]}
			nextStep="Implementar a interface inicial de equipes aproveitando o shell autenticado e os padroes comuns."
			title="Equipes"
		/>
	);
}

export default TeamsPage;
