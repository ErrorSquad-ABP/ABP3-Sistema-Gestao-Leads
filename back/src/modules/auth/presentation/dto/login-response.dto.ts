import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';

class LoginResponseDto {
	@ApiProperty({ type: UserResponseDto })
	user!: UserResponseDto;

	@ApiProperty({
		description:
			'Access JWT (também enviado em cookie HttpOnly). Útil para clientes sem cookies.',
	})
	accessToken!: string;

	@ApiProperty({
		description:
			'Refresh JWT (também em cookie HttpOnly). Útil para clientes sem cookies.',
	})
	refreshToken!: string;
}

export { LoginResponseDto };
