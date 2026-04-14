import { ApiProperty } from '@nestjs/swagger';

class RefreshResponseDto {
	@ApiProperty({
		description:
			'Novo access JWT (também em cookie HttpOnly). Novo refresh só em cookie HttpOnly.',
	})
	accessToken!: string;
}

export { RefreshResponseDto };
