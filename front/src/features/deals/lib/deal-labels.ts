import type { DealImportance, DealStage, DealStatus } from '../model/deals.model';

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

function formatDealStatusLabel(value: DealStatus) {
	return dealStatusLabels[value] ?? value;
}

function formatDealStageLabel(value: DealStage) {
	return dealStageLabels[value] ?? value;
}

function formatDealImportanceLabel(value: DealImportance) {
	return dealImportanceLabels[value] ?? value;
}

const dealStatusOptions = Object.entries(dealStatusLabels).map(([value, label]) => ({
	value: value as DealStatus,
	label,
}));

const dealStageOptions = Object.entries(dealStageLabels).map(([value, label]) => ({
	value: value as DealStage,
	label,
}));

const dealImportanceOptions = Object.entries(dealImportanceLabels).map(
	([value, label]) => ({
		value: value as DealImportance,
		label,
	}),
);

function formatDealValueBRL(value: string | null) {
	if (!value) {
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

export {
	dealImportanceOptions,
	dealStageOptions,
	dealStatusOptions,
	formatDealImportanceLabel,
	formatDealStageLabel,
	formatDealStatusLabel,
	formatDealValueBRL,
};

