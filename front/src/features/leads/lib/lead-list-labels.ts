const statusLabelByCode = new Map<string, string>([
	['NEW', 'Novo'],
	['CONTACTED', 'Contactado'],
	['QUALIFIED', 'Qualificado'],
	['DISQUALIFIED', 'Desqualificado'],
	['CONVERTED', 'Convertido'],
]);

const sourceLabelByCode = new Map<string, string>([
	['store-visit', 'Visita à loja'],
	['phone-call', 'Chamada'],
	['whatsapp', 'WhatsApp'],
	['instagram', 'Instagram'],
	['facebook', 'Facebook'],
	['mercado-livre', 'Mercado Livre'],
	['indication', 'Indicação'],
	['digital-form', 'Formulário digital'],
	['other', 'Outro'],
]);

const leadStatusOptions = [
	{ value: 'NEW', label: 'Novo' },
	{ value: 'CONTACTED', label: 'Contactado' },
	{ value: 'QUALIFIED', label: 'Qualificado' },
	{ value: 'DISQUALIFIED', label: 'Desqualificado' },
	{ value: 'CONVERTED', label: 'Convertido' },
] as const;

const leadSourceOptions = [
	{ value: 'store-visit', label: 'Visita à loja' },
	{ value: 'phone-call', label: 'Chamada' },
	{ value: 'whatsapp', label: 'WhatsApp' },
	{ value: 'instagram', label: 'Instagram' },
	{ value: 'facebook', label: 'Facebook' },
	{ value: 'mercado-livre', label: 'Mercado Livre' },
	{ value: 'indication', label: 'Indicação' },
	{ value: 'digital-form', label: 'Formulário digital' },
	{ value: 'other', label: 'Outro' },
] as const;

function formatLeadStatusLabel(status: string) {
	return statusLabelByCode.get(status) ?? status;
}

function formatLeadSourceLabel(source: string) {
	return sourceLabelByCode.get(source) ?? source;
}

function formatShortId(id: string) {
	if (id.length <= 10) {
		return id;
	}
	return `${id.slice(0, 8)}…`;
}

export {
	formatLeadSourceLabel,
	formatLeadStatusLabel,
	formatShortId,
	leadSourceOptions,
	leadStatusOptions,
};
