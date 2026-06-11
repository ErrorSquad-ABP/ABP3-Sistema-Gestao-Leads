import { isApiError } from '@/lib/http/api-error';
import { humanizeFormApiError } from '@/lib/http/humanize-api-error';

import { DEAL_INVALID_STAGE_SKIP_USER_MESSAGE } from './deal-invalid-stage-transition-user-message';

const DEAL_INVALID_STAGE_TRANSITION_CODE = 'deal.invalid_stage_transition';

function getFriendlyMessageForInvalidStageTransition(apiMessage: string) {
	if (/negociac[aã]o nova|nova deve iniciar/i.test(apiMessage)) {
		return 'Negociações novas começam na primeira etapa do funil. Ajuste a etapa e tente de novo.';
	}
	return DEAL_INVALID_STAGE_SKIP_USER_MESSAGE;
}

function getDealsErrorMessage(error: unknown) {
	if (isApiError(error)) {
		if (error.code === DEAL_INVALID_STAGE_TRANSITION_CODE) {
			return getFriendlyMessageForInvalidStageTransition(error.message);
		}

		if (
			error.status === 400 &&
			error.errors.some(
				(item) => item.code === DEAL_INVALID_STAGE_TRANSITION_CODE,
			)
		) {
			const raw =
				error.errors.find(
					(item) => item.code === DEAL_INVALID_STAGE_TRANSITION_CODE,
				)?.message ?? error.message;
			return getFriendlyMessageForInvalidStageTransition(raw);
		}
	}

	return humanizeFormApiError(error);
}

export { getDealsErrorMessage };
