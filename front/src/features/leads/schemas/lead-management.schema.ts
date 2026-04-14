import { z } from 'zod';

const leadSourceValues = [
	'store-visit',
	'phone-call',
	'whatsapp',
	'instagram',
	'facebook',
	'mercado-livre',
	'indication',
	'digital-form',
	'other',
] as const;

const leadStatusValues = [
	'NEW',
	'CONTACTED',
	'QUALIFIED',
	'DISQUALIFIED',
	'CONVERTED',
] as const;

const uuidPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const nullableUuidTextField = z
	.string()
	.trim()
	.refine((value) => value.length === 0 || uuidPattern.test(value), {
		message: 'Informe um UUID válido ou deixe vazio.',
	});

const leadFormSchema = z.object({
	customerId: z.string().uuid('Selecione um cliente válido.'),
	storeId: z.string().uuid('Informe uma loja válida.'),
	ownerUserId: nullableUuidTextField,
	source: z.enum(leadSourceValues, {
		message: 'Selecione uma origem válida.',
	}),
	status: z.enum(leadStatusValues, {
		message: 'Selecione um estado válido.',
	}),
});

const reassignLeadSchema = z.object({
	ownerUserId: nullableUuidTextField,
});

export {
	leadFormSchema,
	leadSourceValues,
	leadStatusValues,
	reassignLeadSchema,
};
