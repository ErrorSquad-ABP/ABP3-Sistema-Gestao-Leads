import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';

class LoginResponseDto {
	@ApiProperty({ type: UserResponseDto })
	user!: UserResponseDto;

	@ApiProperty({
		description:
			'Access JWT (também enviado em cookie HttpOnly). Útil para clientes sem cookies.',
	})
	accessToken!: string;

	@ApiPropertyOptional({
		description:
			'Só é devolvido quando o cliente envia o cabeçalho `X-Expose-Refresh-Token: true` (ou `1`). Caso contrário o refresh fica apenas em cookie HttpOnly, evitando leitura por JavaScript no browser.',
	})
	refreshToken?: string;
}

export { LoginResponseDto };
