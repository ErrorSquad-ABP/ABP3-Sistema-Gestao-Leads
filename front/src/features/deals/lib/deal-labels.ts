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

function formatDealStatusLabel(value: DealStatus) {
	switch (value) {
		case 'OPEN':
			return dealStatusLabels.OPEN;
		case 'WON':
			return dealStatusLabels.WON;
		case 'LOST':
			return dealStatusLabels.LOST;
		default: {
			const _exhaustive: never = value;
			return _exhaustive;
		}
	}
}

function formatDealStageLabel(value: DealStage) {
	switch (value) {
		case 'INITIAL_CONTACT':
			return dealStageLabels.INITIAL_CONTACT;
		case 'NEGOTIATION':
			return dealStageLabels.NEGOTIATION;
		case 'PROPOSAL':
			return dealStageLabels.PROPOSAL;
		case 'CLOSING':
			return dealStageLabels.CLOSING;
		default: {
			const _exhaustive: never = value;
			return _exhaustive;
		}
	}
}

function formatDealImportanceLabel(value: DealImportance) {
	switch (value) {
		case 'COLD':
			return dealImportanceLabels.COLD;
		case 'WARM':
			return dealImportanceLabels.WARM;
		case 'HOT':
			return dealImportanceLabels.HOT;
		default: {
			const _exhaustive: never = value;
			return _exhaustive;
		}
	}
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
