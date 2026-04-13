import type { UserResponseDto } from '../../application/dto/user-response.dto.js';
import type { User } from '../../domain/entities/user.entity.js';

class UserPresenter {
	static toResponse(user: User): UserResponseDto {
		return {
			id: user.id.value,
			name: user.name.value,
			email: user.email.value,
			role: user.role,
			memberTeamIds: user.memberTeamIds.map((id) => id.value),
			managedTeamIds: user.managedTeamIds.map((id) => id.value),
		} satisfies UserResponseDto;
	}

	static toResponseList(users: readonly User[]): UserResponseDto[] {
		return users.map((u) => UserPresenter.toResponse(u));
	}
}

export { UserPresenter };
