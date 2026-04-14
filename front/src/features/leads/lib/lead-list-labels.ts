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

export { formatLeadSourceLabel, formatLeadStatusLabel, formatShortId };
