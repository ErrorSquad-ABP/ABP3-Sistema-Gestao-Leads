import type { AuthenticatedUser } from '../../login/types/login.types';
import type { AnalyticDashboardFilterMode } from '../model/analytic-dashboard.model';

const NON_ADMIN_MAX_RANGE_DAYS = 366;
const ONE_DAY_IN_MS = 86_400_000;

function parseIsoDate(value: string) {
	return new Date(`${value}T00:00:00.000Z`);
}

function diffDaysInclusive(startDate: string, endDate: string) {
	const start = parseIsoDate(startDate);
	const end = parseIsoDate(endDate);
	return Math.floor((end.getTime() - start.getTime()) / ONE_DAY_IN_MS) + 1;
}

function validateDraftFilter(
	user: AuthenticatedUser,
	mode: AnalyticDashboardFilterMode,
	startDate: string,
	endDate: string,
) {
	if (mode !== 'custom') {
		return null;
	}

	if (!startDate || !endDate) {
		return 'Selecione a data inicial e a data final para aplicar um periodo customizado.';
	}

	if (parseIsoDate(endDate).getTime() < parseIsoDate(startDate).getTime()) {
		return 'A data final precisa ser igual ou posterior a data inicial.';
	}

	if (
		user.role !== 'ADMINISTRATOR' &&
		diffDaysInclusive(startDate, endDate) > NON_ADMIN_MAX_RANGE_DAYS
	) {
		return 'Para este perfil, o periodo customizado pode ter no maximo um ano.';
	}

	return null;
}

export { diffDaysInclusive, validateDraftFilter };
