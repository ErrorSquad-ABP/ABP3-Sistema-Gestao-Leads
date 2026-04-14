import { z } from 'zod';

import { userRoleValues } from '@/features/login/types/login.types';
import type { AccessFeatureKey } from '../types/users.types';

const createUserSchema = z.object({
	name: z.string().trim().min(1, 'Informe o nome do usuário.'),
	email: z.email('Informe um e-mail válido.'),
	password: z
		.string()
		.min(8, 'A senha inicial precisa ter pelo menos 8 caracteres.'),
	role: z.enum(userRoleValues),
	accessGroupId: z.uuid('Selecione um grupo de acesso válido.').nullable(),
});

const updateUserSchema = z.object({
	name: z.string().trim().min(1, 'Informe o nome do usuário.'),
	email: z.email('Informe um e-mail válido.'),
	password: z
		.string()
		.trim()
		.refine(
			(value) => value.length === 0 || value.length >= 8,
			'A nova senha precisa ter pelo menos 8 caracteres.',
		),
	role: z.enum(userRoleValues),
	accessGroupId: z.uuid('Selecione um grupo de acesso válido.').nullable(),
});

const accessFeatureValues = [
	'dashboardOperational',
	'dashboardAnalytic',
	'leads',
	'users',
	'profile',
	'credentials',
	'reports',
	'exports',
] as const satisfies readonly AccessFeatureKey[];

const accessGroupSchema = z.object({
	name: z.string().trim().min(1, 'Informe o nome do grupo.'),
	description: z
		.string()
		.trim()
		.min(1, 'Descreva a finalidade do grupo.')
		.max(240, 'Use uma descrição mais curta.'),
	baseRole: z.enum(userRoleValues).nullable(),
	featureKeys: z
		.array(z.enum(accessFeatureValues))
		.min(1, 'Selecione pelo menos uma permissão para o grupo.'),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
type AccessGroupFormValues = z.infer<typeof accessGroupSchema>;

export type {
	AccessGroupFormValues,
	CreateUserFormValues,
	UpdateUserFormValues,
};
export { accessGroupSchema, createUserSchema, updateUserSchema };
