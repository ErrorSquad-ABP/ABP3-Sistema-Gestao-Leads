import type { UserResponseDto } from '../../application/dto/user-response.dto.js';
import type { User } from '../../domain/entities/user.entity.js';

class UserPresenter {
	static toResponse(user: User): UserResponseDto {
		return {
			accessGroup:
				user.accessGroup === null
					? null
					: {
							id: user.accessGroup.id.value,
							name: user.accessGroup.name,
							description: user.accessGroup.description,
							baseRole: user.accessGroup.baseRole,
							featureKeys: [...user.accessGroup.featureKeys],
							isSystemGroup: user.accessGroup.isSystemGroup,
						},
			accessGroupId:
				user.accessGroupId === null ? null : user.accessGroupId.value,
			id: user.id.value,
			name: user.name.value,
			email: user.email.value,
			role: user.role,
			teamId: user.teamId === null ? null : user.teamId.value,
		} satisfies UserResponseDto;
	}

	static toResponseList(users: readonly User[]): UserResponseDto[] {
		return users.map((u) => UserPresenter.toResponse(u));
	}
}

export { UserPresenter };
