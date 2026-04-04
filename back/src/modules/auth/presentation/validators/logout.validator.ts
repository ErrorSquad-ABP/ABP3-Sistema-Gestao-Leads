import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

class LogoutValidator {
	@ApiPropertyOptional({
		description:
			'Access JWT se não estiver em cookie nem em Authorization Bearer.',
		minLength: 10,
	})
	@IsOptional()
	@IsString()
	@MinLength(10)
	accessToken?: string;

	@ApiPropertyOptional({
		description:
			'Refresh opaco se não estiver no cookie HttpOnly; usado para revogar a sessão no servidor.',
		minLength: 38,
	})
	@IsOptional()
	@IsString()
	@MinLength(38)
	refreshToken?: string;
}

export { LogoutValidator };
