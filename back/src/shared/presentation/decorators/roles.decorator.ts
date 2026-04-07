import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '../../domain/enums/user-role.enum.js';

const ROLES_KEY = 'auth.roles';

const Roles = (...roles: readonly UserRole[]) => SetMetadata(ROLES_KEY, roles);

export { ROLES_KEY, Roles };
