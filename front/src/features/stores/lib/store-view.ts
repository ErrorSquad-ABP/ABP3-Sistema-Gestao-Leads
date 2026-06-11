import {
	humanizeFormApiError,
	humanizePageApiError,
} from '@/lib/http/humanize-api-error';

import type { StoreRecord } from '../model/stores.model';

type StoreProfile = {
	addressLine: string;
	coverage: string;
	cityState: string;
	distributionRegion: string;
	region: string;
	scope: string;
	state: string;
};

type StoreTableRow = StoreProfile & {
	convertedLeadCount: number;
	conversionRate: number;
	initials: string;
	leadCount: number;
	openDealsCount: number;
	ownerEmail: string | null;
	ownerInitials: string;
	ownerName: string;
	store: StoreRecord;
	teamCount: number;
	wonValue: number;
};

const STORE_PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
const DEFAULT_STORE_PAGE_SIZE = 5;

const stateLabels = new Map([
	['AC', 'Acre'],
	['AL', 'Alagoas'],
	['AP', 'Amapá'],
	['AM', 'Amazonas'],
	['BA', 'Bahia'],
	['CE', 'Ceará'],
	['DF', 'Distrito Federal'],
	['ES', 'Espírito Santo'],
	['GO', 'Goiás'],
	['MA', 'Maranhão'],
	['MT', 'Mato Grosso'],
	['MS', 'Mato Grosso do Sul'],
	['MG', 'Minas Gerais'],
	['PA', 'Pará'],
	['PB', 'Paraíba'],
	['PR', 'Paraná'],
	['PE', 'Pernambuco'],
	['PI', 'Piauí'],
	['RJ', 'Rio de Janeiro'],
	['RN', 'Rio Grande do Norte'],
	['RS', 'Rio Grande do Sul'],
	['RO', 'Rondônia'],
	['RR', 'Roraima'],
	['SC', 'Santa Catarina'],
	['SP', 'São Paulo'],
	['SE', 'Sergipe'],
	['TO', 'Tocantins'],
]);

function getStoresErrorMessage(error: unknown) {
	return humanizeFormApiError(error);
}

function getStoresPageErrorMessage(error: unknown) {
	return humanizePageApiError(error);
}

function normalizeSearch(value: string) {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();
}

function getStoreInitials(name: string) {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 3)
		.toUpperCase();
	return initials || 'LJ';
}

function getPersonInitials(name: string) {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	return initials || 'NA';
}

function formatOptionalStoreText(value: string | null | undefined) {
	const normalized = value?.trim();
	return normalized ? normalized : 'Não informado';
}

function resolveStoreProfile(store: StoreRecord): StoreProfile {
	const state = formatOptionalStoreText(store.state);
	const city = formatOptionalStoreText(store.city);
	const hasCityState = city !== 'Não informado' && state !== 'Não informado';

	return {
		addressLine: formatOptionalStoreText(store.addressLine),
		coverage: formatOptionalStoreText(store.coverage),
		cityState: hasCityState
			? `${city}, ${state}`
			: formatOptionalStoreText(city),
		distributionRegion: formatOptionalStoreText(store.distributionRegion),
		region: formatOptionalStoreText(store.region),
		scope: formatOptionalStoreText(store.scope),
		state,
	};
}

export {
	DEFAULT_STORE_PAGE_SIZE,
	STORE_PAGE_SIZE_OPTIONS,
	getPersonInitials,
	getStoreInitials,
	getStoresErrorMessage,
	getStoresPageErrorMessage,
	normalizeSearch,
	resolveStoreProfile,
	stateLabels,
};
export type { StoreProfile, StoreTableRow };
