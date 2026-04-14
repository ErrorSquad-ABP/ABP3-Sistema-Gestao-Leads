import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
} from '@nestjs/common';
// biome-ignore lint/style/useImportType: Reflector é token de DI em runtime
import { Reflector } from '@nestjs/core';

import type { UserRole } from '../../shared/domain/enums/user-role.enum.js';
import { ROLES_KEY } from '../../shared/presentation/decorators/roles.decorator.js';

@Injectable()
class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const roles = this.reflector.getAllAndOverride<readonly UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (!roles?.length) {
			return true;
		}
		const request = context.switchToHttp().getRequest<{
			user?: { role?: UserRole };
		}>();
		const role = request.user?.role;
		if (role === undefined) {
			return false;
		}
		return roles.includes(role);
	}
}

export { RolesGuard };
