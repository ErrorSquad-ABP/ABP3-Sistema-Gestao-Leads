import type { StoreSummary } from '../types/stores.types';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function parseStore(value: unknown): StoreSummary {
	if (!isRecord(value)) {
		throw new TypeError('Contrato HTTP inválido para store.');
	}

	return {
		id: String(value.id),
		name: String(value.name),
	};
}

function parseStoreList(value: unknown): StoreSummary[] {
	if (!Array.isArray(value)) {
		throw new TypeError('Contrato HTTP inválido para lista de stores.');
	}

	return value.map(parseStore);
}

export { parseStore, parseStoreList };
