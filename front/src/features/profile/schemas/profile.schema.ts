import { z } from 'zod';

const updateOwnEmailSchema = z.object({
	currentPassword: z
		.string()
		.min(1, 'Informe sua senha atual para confirmar a alteração.'),
	email: z.email('Informe um e-mail válido.'),
});

const updateOwnPasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, 'Informe sua senha atual para continuar.'),
		newPassword: z
			.string()
			.min(8, 'A nova senha deve ter pelo menos 8 caracteres.')
			.max(128, 'A nova senha deve ter no máximo 128 caracteres.'),
		confirmPassword: z
			.string()
			.min(1, 'Confirme a nova senha para concluir a atualização.'),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'A confirmação da senha deve ser igual à nova senha.',
	});

const credentialUpdateResponseSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	email: z.email(),
	role: z.enum(['ATTENDANT', 'MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR']),
	teamId: z.uuid().nullable(),
	refreshSessionsRevoked: z.boolean(),
});

export {
	credentialUpdateResponseSchema,
	updateOwnEmailSchema,
	updateOwnPasswordSchema,
};
