import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

class RefreshValidator {
	@ApiPropertyOptional({
		description:
			'Refresh opaco se não estiver no cookie HttpOnly (`refresh_token` por defeito).',
		minLength: 38,
	})
	@IsOptional()
	@IsString()
	@MinLength(38)
	refreshToken?: string;
}

export { RefreshValidator };
