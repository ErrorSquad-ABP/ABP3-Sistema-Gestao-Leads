import type { Prisma } from '../../../../generated/prisma/client.js';

function buildListTeamLeadsWhere(teamId: string): Prisma.LeadWhereInput {
	return {
		owner: {
			is: {
				teamId,
			},
		},
	};
}

export { buildListTeamLeadsWhere };
