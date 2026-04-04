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
			'Refresh JWT se não vier de cookie, `X-Refresh-Token` nem `Authorization: Bearer`.',
		minLength: 10,
	})
	@IsOptional()
	@IsString()
	@MinLength(10)
	refreshToken?: string;
}

export { LogoutValidator };
