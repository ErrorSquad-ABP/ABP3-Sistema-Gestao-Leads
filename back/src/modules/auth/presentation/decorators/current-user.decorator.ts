import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

type JwtUser = {
	readonly userId: string;
	readonly role: string;
	readonly jti: string;
};

const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): JwtUser => {
		const req = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
		return req.user;
	},
);

export type { JwtUser };
export { CurrentUser };
