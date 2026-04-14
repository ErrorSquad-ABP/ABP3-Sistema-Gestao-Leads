import type { UserResponseDto } from '../../application/dto/user-response.dto.js';
import type { User } from '../../domain/entities/user.entity.js';

/** Contrato legado: um único UUID para clientes que ainda leem `teamId` (sessão / telas antigas). */
function legacyTeamIdForApi(user: User): string | null {
	const members = [...user.memberTeamIds].map((id) => id.value).sort();
	const firstMember = members.at(0);
	if (firstMember !== undefined) {
		return firstMember;
	}
	const managed = [...user.managedTeamIds].map((id) => id.value).sort();
	const firstManaged = managed.at(0);
	if (firstManaged !== undefined) {
		return firstManaged;
	}
	return null;
}

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
			teamId: legacyTeamIdForApi(user),
			memberTeamIds: user.memberTeamIds.map((id) => id.value),
			managedTeamIds: user.managedTeamIds.map((id) => id.value),
		} satisfies UserResponseDto;
	}

	static toResponseList(users: readonly User[]): UserResponseDto[] {
		return users.map((u) => UserPresenter.toResponse(u));
	}
}

export { UserPresenter };
