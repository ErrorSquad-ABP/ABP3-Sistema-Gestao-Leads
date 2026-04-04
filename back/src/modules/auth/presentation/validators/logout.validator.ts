import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

class LogoutValidator {
	@ApiPropertyOptional({
		description:
			'Access JWT se não estiver em cookie nem em Authorization Bearer (logout só limpa cookies; token continua válido até expirar).',
		minLength: 10,
	})
	@IsOptional()
	@IsString()
	@MinLength(10)
	accessToken?: string;
}

export { LogoutValidator };
