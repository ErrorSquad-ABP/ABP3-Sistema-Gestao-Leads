import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { UserRole } from '../../shared/domain/enums/user-role.enum.js';

type JwtUser = {
	readonly sub: string;
	readonly role: UserRole;
};

const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): JwtUser => {
		const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
		return request.user;
	},
);

export type { JwtUser };
export { CurrentUser };
