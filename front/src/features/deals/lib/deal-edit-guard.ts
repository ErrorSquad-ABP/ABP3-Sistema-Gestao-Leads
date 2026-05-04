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

export { getDealFormEditBlockReason };
