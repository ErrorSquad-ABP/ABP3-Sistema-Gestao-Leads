import { z } from 'zod';

import { userRoleValues } from '../types/login.types';

const userRoleSchema = z.enum(userRoleValues);
const accessFeatureValues = [
	'dashboardOperational',
	'dashboardAnalytic',
	'leads',
	'users',
	'profile',
	'credentials',
	'reports',
	'exports',
] as const;
const accessFeatureSchema = z.enum(accessFeatureValues);
const accessGroupSummarySchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	description: z.string().min(1),
	baseRole: userRoleSchema.nullable(),
	featureKeys: z.array(accessFeatureSchema),
	isSystemGroup: z.boolean(),
});

const authenticatedUserSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	email: z.email(),
	role: userRoleSchema,
	teamId: z.uuid().nullable(),
	memberTeamIds: z.array(z.uuid()).default([]),
	managedTeamIds: z.array(z.uuid()).default([]),
	accessGroupId: z.uuid().nullable(),
	accessGroup: accessGroupSummarySchema.nullable(),
});

const loginSchema = z.object({
	email: z.email('Informe um e-mail válido.'),
	password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
});

const loginResponseSchema = z.object({
	user: authenticatedUserSchema,
	accessToken: z.string().min(1),
});

export {
	authenticatedUserSchema,
	accessGroupSummarySchema,
	loginResponseSchema,
	loginSchema,
	userRoleSchema,
};
