import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from '../../../users/application/dto/user-response.dto.js';

/**
 * Resposta de PATCH de credenciais próprias: dados do utilizador + sinal explícito de revogação de refresh.
 */
@ApiExtraModels(UserResponseDto)
class CredentialUpdateUserResponseDto extends UserResponseDto {
	@ApiProperty({
		description:
			'Quando true, todas as sessões de refresh deste utilizador foram invalidadas no servidor; a resposta HTTP também limpa o cookie HttpOnly de refresh (se existir). O access JWT em curso mantém-se válido até expirar; após isso é necessário voltar a autenticar-se (login) para obter novo par access+refresh.',
		example: true,
	})
	refreshSessionsRevoked!: boolean;
}

export { CredentialUpdateUserResponseDto };
