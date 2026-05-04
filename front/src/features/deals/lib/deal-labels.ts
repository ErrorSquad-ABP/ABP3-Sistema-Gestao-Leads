import type {
	DealImportance,
	DealStage,
	DealStatus,
} from '../model/deals.model';

const dealStatusLabels: Record<DealStatus, string> = {
	OPEN: 'Em aberto',
	WON: 'Ganha',
	LOST: 'Perdida',
};

const dealStageLabels: Record<DealStage, string> = {
	INITIAL_CONTACT: 'Contato inicial',
	NEGOTIATION: 'Negociação',
	PROPOSAL: 'Proposta',
	CLOSING: 'Fechamento',
};

const dealImportanceLabels: Record<DealImportance, string> = {
	COLD: 'Fria',
	WARM: 'Morna',
	HOT: 'Quente',
};

const dealStatusLabelsByKey: Record<string, string> = dealStatusLabels;
const dealStageLabelsByKey: Record<string, string> = dealStageLabels;
const dealImportanceLabelsByKey: Record<string, string> = dealImportanceLabels;

/** Campos de histórico (Prisma `DealHistoryField`) em texto amigável. */
const dealHistoryFieldTitle: Record<string, string> = {
	IMPORTANCE: 'Importância',
	STAGE: 'Etapa',
	STATUS: 'Status',
	TITLE: 'Título',
	VALUE: 'Valor',
	VEHICLE: 'Veículo',
};

const uuidV4Re =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isLikelyUuid(value: string): boolean {
	return uuidV4Re.test(value.trim());
}

/**
 * Exibe id interno sem tom cru (UUID completo), para histórico e fallbacks.
 */
function shortenInternalId(value: string): string {
	const t = value.trim();
	if (t.length <= 15) {
		return t;
	}
	return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

function labelFromMapOrToken(
	labels: Record<string, string>,
	value: string,
): string {
	const key = value.trim();
	const fromMap = new Map(Object.entries(labels)).get(key);
	if (fromMap !== undefined) {
		return fromMap;
	}
	/** Fallback: enum desconhecido (versões futuras) */
	if (!key) {
		return '—';
	}
	return key.replaceAll('_', ' ').toLowerCase();
}

function formatDealStatusLabel(value: string): string {
	return labelFromMapOrToken(dealStatusLabelsByKey, value);
}

function formatDealStageLabel(value: string): string {
	return labelFromMapOrToken(dealStageLabelsByKey, value);
}

function formatDealImportanceLabel(value: string): string {
	return labelFromMapOrToken(dealImportanceLabelsByKey, value);
}

const dealStatusOptions = Object.entries(dealStatusLabels).map(
	([value, label]) => ({
		value: value as DealStatus,
		label,
	}),
);

const dealStageOptions = Object.entries(dealStageLabels).map(
	([value, label]) => ({
		value: value as DealStage,
		label,
	}),
);

const dealImportanceOptions = Object.entries(dealImportanceLabels).map(
	([value, label]) => ({
		value: value as DealImportance,
		label,
	}),
);

function formatDealValueBRL(value: string | null) {
	if (value == null || value === '') {
		return 'Não informado';
	}
	const numberValue = Number(value);
	if (!Number.isFinite(numberValue)) {
		return value;
	}
	return numberValue.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
}

function formatDealHistoryFieldName(field: string): string {
	const k = field.trim().toUpperCase();
	const fromMap = new Map(Object.entries(dealHistoryFieldTitle)).get(k);
	if (fromMap !== undefined) {
		return fromMap;
	}
	return labelFromMapOrToken({}, field);
}

/**
 * Exibe o valor de histórico conforme o tipo de campo (enum, BRL, UUID de veículo, texto).
 */
function formatDealHistoryValueDisplay(
	field: string,
	raw: string | null,
): string {
	if (raw === null) {
		return '—';
	}
	const f = field.trim().toUpperCase();
	if (f === 'VALUE' && raw === '') {
		return 'Não informado';
	}
	if (f === 'VEHICLE') {
		if (raw === '') {
			return '—';
		}
		if (isLikelyUuid(raw)) {
			return `Identificador do veículo: ${shortenInternalId(raw)}`;
		}
		return raw;
	}
	if (f === 'STATUS') {
		return formatDealStatusLabel(raw);
	}
	if (f === 'STAGE') {
		return formatDealStageLabel(raw);
	}
	if (f === 'IMPORTANCE') {
		return formatDealImportanceLabel(raw);
	}
	if (f === 'VALUE') {
		return formatDealValueBRL(raw);
	}
	if (f === 'TITLE') {
		return raw;
	}
	return raw;
}

function formatDealLeadCustomerDisplay(leadCustomerName: string) {
	const n = (leadCustomerName ?? '').trim();
	if (n && isLikelyUuid(n)) {
		return 'Cliente vinculado (nome indisponível no momento)';
	}
	if (n) {
		return n;
	}
	return 'Cliente não informado';
}

function formatDealLeadOwnerDisplay(leadOwnerName: string | null) {
	const n = (leadOwnerName ?? '').trim();
	if (n) {
		return n;
	}
	return 'Sem responsável';
}

export {
	dealImportanceOptions,
	dealStageOptions,
	dealStatusOptions,
	formatDealHistoryFieldName,
	formatDealHistoryValueDisplay,
	formatDealImportanceLabel,
	formatDealLeadCustomerDisplay,
	formatDealLeadOwnerDisplay,
	formatDealStageLabel,
	formatDealStatusLabel,
	formatDealValueBRL,
	isLikelyUuid,
	shortenInternalId,
};
