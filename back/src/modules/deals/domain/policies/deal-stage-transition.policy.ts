import {
	DEAL_STAGES,
	type DealStage,
} from '../../../../shared/domain/enums/deal-stage.enum.js';
import { DealInvalidStageTransitionError } from '../errors/deal-invalid-stage-transition.error.js';

/**
 * Ordem do funil comercial (única fonte: {@link DEAL_STAGES}).
 */
const PIPELINE = DEAL_STAGES;

function stageIndex(stage: DealStage): number {
	return PIPELINE.indexOf(stage);
}

/**
 * Negociação nova deve começar na primeira etapa do funil.
 */
function assertDealCreationStage(stage: DealStage): void {
	if (stage !== PIPELINE[0]) {
		throw new DealInvalidStageTransitionError(
			`Negociacao nova deve iniciar em ${PIPELINE[0]} (recebido: ${stage}).`,
		);
	}
}

/**
 * Só permite ir para o estágio imediatamente anterior ou seguinte (sem saltos).
 */
function assertAdjacentDealStageTransition(
	from: DealStage,
	to: DealStage,
): void {
	if (from === to) {
		return;
	}
	const i = stageIndex(from);
	const j = stageIndex(to);
	if (Math.abs(j - i) !== 1) {
		throw new DealInvalidStageTransitionError(
			`Transicao de estagio invalida: ${from} -> ${to}. Avance ou recue apenas uma etapa por vez.`,
		);
	}
}

export { assertAdjacentDealStageTransition, assertDealCreationStage, PIPELINE };
