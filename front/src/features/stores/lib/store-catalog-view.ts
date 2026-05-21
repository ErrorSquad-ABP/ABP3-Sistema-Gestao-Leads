import { isApiError } from '@/lib/http/api-error';

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

const STORES_PAGE_SIZE = 6;

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

const stateSearchTerms = new Map([
	['AC', ['acre', 'rio branco']],
	['AL', ['alagoas', 'maceio']],
	['AP', ['amapa', 'macapa']],
	['AM', ['amazonas', 'manaus']],
	['BA', ['bahia', 'salvador']],
	['CE', ['ceara', 'fortaleza']],
	['DF', ['distrito federal', 'brasilia']],
	['ES', ['espirito santo', 'vitoria']],
	['GO', ['goias', 'goiania']],
	['MA', ['maranhao', 'sao luis']],
	['MT', ['mato grosso', 'cuiaba']],
	['MS', ['mato grosso do sul', 'campo grande']],
	['MG', ['minas gerais', 'belo horizonte']],
	['PA', ['para', 'belem']],
	['PB', ['paraiba', 'joao pessoa']],
	['PR', ['parana', 'curitiba']],
	['PE', ['pernambuco', 'recife']],
	['PI', ['piaui', 'teresina']],
	['RJ', ['rio de janeiro']],
	['RN', ['rio grande do norte', 'natal']],
	['RS', ['rio grande do sul', 'porto alegre']],
	['RO', ['rondonia', 'porto velho']],
	['RR', ['roraima', 'boa vista']],
	['SC', ['santa catarina', 'florianopolis']],
	['SP', ['sao paulo', 'cacapava', 'sjc', 'sao jose']],
	['SE', ['sergipe', 'aracaju']],
	['TO', ['tocantins', 'palmas']],
]);

const brazilRegionsByState = new Map([
	['AC', 'Norte'],
	['AL', 'Nordeste'],
	['AP', 'Norte'],
	['AM', 'Norte'],
	['BA', 'Nordeste'],
	['CE', 'Nordeste'],
	['DF', 'Centro-Oeste'],
	['ES', 'Sudeste'],
	['GO', 'Centro-Oeste'],
	['MA', 'Nordeste'],
	['MT', 'Centro-Oeste'],
	['MS', 'Centro-Oeste'],
	['MG', 'Sudeste'],
	['PA', 'Norte'],
	['PB', 'Nordeste'],
	['PR', 'Sul'],
	['PE', 'Nordeste'],
	['PI', 'Nordeste'],
	['RJ', 'Sudeste'],
	['RN', 'Nordeste'],
	['RS', 'Sul'],
	['RO', 'Norte'],
	['RR', 'Norte'],
	['SC', 'Sul'],
	['SP', 'Sudeste'],
	['SE', 'Nordeste'],
	['TO', 'Norte'],
]);

function getStoresErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora.';
	}
	return error.message;
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

function resolveStateCode(name: string) {
	const searchableName = ` ${name.replace(/[^a-z0-9]+/g, ' ')} `;
	const words = searchableName.trim().split(/\s+/);

	for (const stateCode of stateLabels.keys()) {
		if (words.includes(stateCode.toLowerCase())) {
			return stateCode;
		}
	}

	for (const [stateCode, terms] of stateSearchTerms.entries()) {
		if (terms.some((term) => searchableName.includes(` ${term} `))) {
			return stateCode;
		}
	}

	return null;
}

function resolveBrazilRegion(stateCode: string) {
	return brazilRegionsByState.get(stateCode) ?? 'Outras regiões';
}

function resolveStoreProfile(store: StoreRecord): StoreProfile {
	const name = normalizeSearch(store.name);

	if (name.includes('cacapava')) {
		return {
			addressLine: 'Rua Cel. João Dias, 500',
			coverage: 'SP',
			cityState: 'Caçapava, SP',
			distributionRegion: resolveBrazilRegion('SP'),
			region: 'Vale do Paraíba - SP',
			scope: 'Abrangência: Caçapava, Taubaté, Pindamonhangaba e região.',
			state: 'SP',
		};
	}

	if (name.includes('sjc') || name.includes('sao jose')) {
		return {
			addressLine: 'Av. Andrômeda, 885',
			coverage: 'SP',
			cityState: 'São José dos Campos, SP',
			distributionRegion: resolveBrazilRegion('SP'),
			region: 'São José dos Campos - SP',
			scope: 'Abrangência: São José dos Campos, Jacareí e região.',
			state: 'SP',
		};
	}

	if (name.includes('matriz') || name.includes('sede')) {
		return {
			addressLine: 'Av. das Nações Unidas, 12901',
			coverage: 'SP',
			cityState: 'São Paulo, SP',
			distributionRegion: resolveBrazilRegion('SP'),
			region: 'Matriz - Sede',
			scope:
				'Gestão estratégica, suporte comercial e governança das operações.',
			state: 'SP',
		};
	}

	const stateCode = resolveStateCode(name);
	if (stateCode) {
		const stateName = stateLabels.get(stateCode) ?? stateCode;
		return {
			addressLine: 'Operação regional',
			coverage: stateCode,
			cityState: `${stateName}, ${stateCode}`,
			distributionRegion: resolveBrazilRegion(stateCode),
			region: `${stateName} - ${stateCode}`,
			scope: `Abrangência: operação comercial regional em ${stateName}.`,
			state: stateCode,
		};
	}

	return {
		addressLine: 'Operação regional',
		coverage: 'SP',
		cityState: 'São Paulo, SP',
		distributionRegion: resolveBrazilRegion('SP'),
		region: 'Operação regional',
		scope: 'Abrangência definida pela estrutura comercial da loja.',
		state: 'SP',
	};
}

export {
	getStoreInitials,
	getPersonInitials,
	getStoresErrorMessage,
	normalizeSearch,
	resolveStoreProfile,
	stateLabels,
	STORES_PAGE_SIZE,
};
export type { StoreProfile, StoreTableRow };
