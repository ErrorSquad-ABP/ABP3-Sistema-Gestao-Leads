import type { AccessGroupSummaryDto } from '../../application/dto/access-group-summary.dto.js';
import type { UserResponseDto } from '../../application/dto/user-response.dto.js';
import type {
	User,
	UserAccessGroupSummary,
} from '../../domain/entities/user.entity.js';

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

function toAccessGroupDto(group: UserAccessGroupSummary): AccessGroupSummaryDto {
	return {
		id: group.id.value,
		name: group.name,
		description: group.description,
		baseRole: group.baseRole,
		featureKeys: [...group.featureKeys],
		isSystemGroup: group.isSystemGroup,
	};
}

function sortedByName(
	groups: readonly UserAccessGroupSummary[],
): UserAccessGroupSummary[] {
	return [...groups].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

class UserPresenter {
	static toResponse(user: User): UserResponseDto {
		const orderedGroups = sortedByName(user.accessGroups);
		const legacyGroup = orderedGroups.at(0) ?? null;
		const accessGroupIds =
			orderedGroups.length > 0
				? orderedGroups.map((group) => group.id.value)
				: user.accessGroupIds.map((id) => id.value);
		return {
			accessGroupIds,
			accessGroups: orderedGroups.map((group) => toAccessGroupDto(group)),
			featureKeys: [...user.featureKeys],
			accessGroup: legacyGroup === null ? null : toAccessGroupDto(legacyGroup),
			accessGroupId: legacyGroup === null ? null : legacyGroup.id.value,
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
