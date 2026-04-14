/**
 * Lançada quando a loja não pode ser excluída por vínculos com {@link Lead} ou {@link Team}
 * (schema: `onDelete: Restrict` nos FKs que apontam para Store).
 */
class StoreDeleteBlockedError extends Error {
	readonly code = 'store.delete_blocked';

	readonly leads: number;
	readonly teams: number;

	private constructor(message: string, leads: number, teams: number) {
		super(message);
		this.name = StoreDeleteBlockedError.name;
		this.leads = leads;
		this.teams = teams;
	}

	static withCounts(
		storeId: string,
		counts: { readonly leads: number; readonly teams: number },
	): StoreDeleteBlockedError {
		const { leads, teams } = counts;
		const parts: string[] = [];
		if (teams > 0) {
			parts.push(`${teams} equipe(s)`);
		}
		if (leads > 0) {
			parts.push(`${leads} lead(s)`);
		}
		const msg =
			parts.length > 0
				? `Não é possível excluir a loja "${storeId}": ainda existem ${parts.join(' e ')} vinculados.`
				: `Não é possível excluir a loja "${storeId}": existem vínculos impedindo a exclusão.`;
		return new StoreDeleteBlockedError(msg, leads, teams);
	}

	/** Quando a infraestrutura sinaliza violação de FK sem contagem prévia (ex.: corrida). */
	static fromReferentialIntegrityFailure(
		storeId: string,
	): StoreDeleteBlockedError {
		return new StoreDeleteBlockedError(
			`Não é possível excluir a loja "${storeId}": existem registros vinculados (integridade referencial).`,
			0,
			0,
		);
	}
}

export { StoreDeleteBlockedError };
