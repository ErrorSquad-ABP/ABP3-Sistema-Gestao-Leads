import type { Deal } from '../model/deals.model';

/** Mensagem amigável se o formulário de edição não deve abrir; `null` quando pode editar. */
function getDealFormEditBlockReason(deal: Deal): string | null {
	if (!deal.canMutate) {
		return 'Você não tem permissão para editar esta negociação.';
	}
	if (deal.status !== 'OPEN') {
		return 'Negociações encerradas (ganhas ou perdidas) não podem ser editadas.';
	}
	return null;
}

/** Critério alinhado à edição: só permite arrastar no funil quando o formulário também poderia abrir para edição. */
function dealAllowsKanbanStageDrag(deal: Deal): boolean {
	return getDealFormEditBlockReason(deal) === null;
}

export { getDealFormEditBlockReason, dealAllowsKanbanStageDrag };
