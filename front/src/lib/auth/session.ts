import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { authenticatedUserSchema } from '@/features/login/schemas/login.schema';
import type {
	AuthenticatedUser,
	UserRole,
} from '@/features/login/types/login.types';
import { env } from '@/lib/env';
import {
	hasFeatureAccess,
	resolveDefaultAppRoute,
	type AppRouteAccessKey,
} from '@/lib/auth/permissions';
import { appRoutes } from '@/lib/routes/app-routes';

const getCurrentUserFromRequest = cache(
	async (): Promise<AuthenticatedUser | null> => {
		const requestCookies = await cookies();
		const cookieHeader = requestCookies.toString();

		if (!cookieHeader) {
			return null;
		}

		const response = await fetch(
			`${env.apiInternalUrl.replace(/\/$/, '')}/api/auth/me`,
			{
				cache: 'no-store',
				headers: {
					Accept: 'application/json',
					Cookie: cookieHeader,
				},
			},
		);

		if (response.status === 401 || response.status === 403) {
			return null;
		}

		if (!response.ok) {
			throw new Error(
				`Failed to bootstrap request session from API: ${response.status}.`,
			);
		}

		const payload = (await response.json()) as unknown;

		if (
			typeof payload === 'object' &&
			payload !== null &&
			'success' in payload &&
			'data' in payload
		) {
			return authenticatedUserSchema.parse((payload as { data: unknown }).data);
		}

		return authenticatedUserSchema.parse(payload);
	},
);

async function requireAuthenticatedUser() {
	const currentUser = await getCurrentUserFromRequest();

	if (!currentUser) {
		redirect(appRoutes.system.unauthorized);
	}

	return currentUser;
}

async function requireUserWithRoles(allowedRoles: readonly UserRole[]) {
	const currentUser = await requireAuthenticatedUser();

	if (!allowedRoles.includes(currentUser.role)) {
		redirect(appRoutes.system.forbidden);
	}

	return currentUser;
}

async function requireUserWithRouteAccess(routeKey: AppRouteAccessKey) {
	const currentUser = await requireAuthenticatedUser();

	if (!hasFeatureAccess(currentUser, routeKey)) {
		redirect(appRoutes.system.forbidden);
	}

	return currentUser;
}

async function redirectToHomeRouteForRequestUser() {
	const currentUser = await requireAuthenticatedUser();

	redirect(resolveDefaultAppRoute(currentUser));
}

export {
	getCurrentUserFromRequest,
	redirectToHomeRouteForRequestUser,
	requireAuthenticatedUser,
	requireUserWithRouteAccess,
	requireUserWithRoles,
};
