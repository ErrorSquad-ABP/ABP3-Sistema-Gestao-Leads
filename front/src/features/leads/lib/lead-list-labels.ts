function normalizeLeadToken(value: string) {
	return value
		.trim()
		.replace(/[\s-]+/g, '_')
		.toUpperCase();
}

const statusLabelByCode = new Map<string, string>([
	['NEW', 'Novo'],
	['CONTACTED', 'Contactado'],
	['QUALIFIED', 'Qualificado'],
	['NEGOTIATING', 'Em negociação'],
	['CONVERTED', 'Convertido'],
	['LOST', 'Perdido'],
	['DISQUALIFIED', 'Desqualificado'],
	['DESQUALIFIED', 'Desqualificado'],
]);

const sourceLabelByCode = new Map<string, string>([
	['WEBSITE', 'Formulário digital'],
	['FORM', 'Formulário digital'],
	['DIGITAL_FORM', 'Formulário digital'],
	['WHATSAPP', 'WhatsApp'],
	['PHONE', 'Contato telefônico'],
	['CALL', 'Contato telefônico'],
	['WALK_IN', 'Visita à loja'],
	['STORE_VISIT', 'Visita à loja'],
	['VISIT', 'Visita à loja'],
	['INDICATION', 'Indicação'],
	['REFERRAL', 'Indicação'],
	['OTHER', 'Outros meios'],
	['INSTAGRAM', 'Instagram'],
	['FACEBOOK', 'Facebook'],
	['MERCADO_LIVRE', 'Mercado Livre'],
]);

const leadStatusOptions = [
	{ value: 'NEW', label: 'Novo' },
	{ value: 'CONTACTED', label: 'Contactado' },
	{ value: 'QUALIFIED', label: 'Qualificado' },
	{ value: 'NEGOTIATING', label: 'Em negociação' },
	{ value: 'CONVERTED', label: 'Convertido' },
	{ value: 'LOST', label: 'Perdido' },
] as const;

const leadSourceOptions = [
	{ value: 'WEBSITE', label: 'Formulário digital' },
	{ value: 'WHATSAPP', label: 'WhatsApp' },
	{ value: 'PHONE', label: 'Contato telefônico' },
	{ value: 'WALK_IN', label: 'Visita à loja' },
	{ value: 'INDICATION', label: 'Indicação' },
	{ value: 'OTHER', label: 'Outros meios' },
	{ value: 'INSTAGRAM', label: 'Instagram' },
	{ value: 'FACEBOOK', label: 'Facebook' },
	{ value: 'MERCADO_LIVRE', label: 'Mercado Livre' },
] as const;

function normalizeLeadStatusKey(status: string) {
	return normalizeLeadToken(status);
}

function normalizeLeadSourceKey(source: string) {
	return normalizeLeadToken(source);
}

function formatLeadStatusLabel(status: string) {
	return statusLabelByCode.get(normalizeLeadStatusKey(status)) ?? status;
}

function formatLeadSourceLabel(source: string) {
	return sourceLabelByCode.get(normalizeLeadSourceKey(source)) ?? source;
}

function getLeadSourceBadgeClass(source: string) {
	switch (normalizeLeadSourceKey(source)) {
		case 'INSTAGRAM':
			return 'border-[#E1306C]/20 bg-[#E1306C]/10 text-[#C13584]';
		case 'WHATSAPP':
			return 'border-[#25D366]/20 bg-[#25D366]/10 text-[#15803d]';
		case 'FACEBOOK':
			return 'border-[#1877F2]/20 bg-[#1877F2]/10 text-[#1256b8]';
		case 'MERCADO_LIVRE':
			return 'border-[#FFE600]/35 bg-[#FFF6B3] text-[#8A6D00]';
		case 'WEBSITE':
		case 'FORM':
		case 'DIGITAL_FORM':
			return 'border-[#2563EB]/20 bg-[#2563EB]/10 text-[#1D4ED8]';
		case 'PHONE':
		case 'CALL':
			return 'border-[#0F766E]/20 bg-[#0F766E]/10 text-[#0F766E]';
		case 'WALK_IN':
		case 'STORE_VISIT':
		case 'VISIT':
			return 'border-[#D96C3F]/20 bg-[#D96C3F]/10 text-[#B3542C]';
		case 'INDICATION':
		case 'REFERRAL':
			return 'border-[#7C3AED]/20 bg-[#7C3AED]/10 text-[#6D28D9]';
		default:
			return 'border-[#64748B]/20 bg-[#64748B]/10 text-[#475569]';
	}
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
	getLeadSourceBadgeClass,
	leadSourceOptions,
	leadStatusOptions,
	normalizeLeadSourceKey,
	normalizeLeadStatusKey,
};
