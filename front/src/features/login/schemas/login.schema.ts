import { z } from 'zod';

import { userRoleValues } from '../types/login.types';

const userRoleSchema = z.enum(userRoleValues);

const authenticatedUserSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	email: z.email(),
	role: userRoleSchema,
	teamId: z.uuid().nullable(),
});

const loginSchema = z.object({
	email: z.email('Informe um e-mail válido.'),
	password: z
		.string()
		.min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

const loginResponseSchema = z.object({
	user: authenticatedUserSchema,
	accessToken: z.string().min(1),
});

export {
	authenticatedUserSchema,
	loginResponseSchema,
	loginSchema,
	userRoleSchema,
};
