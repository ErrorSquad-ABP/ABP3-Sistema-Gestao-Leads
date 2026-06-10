import type { AuditLog } from '../entities/audit-log.entity.js';
import type { AuditActionType } from '../../../../shared/domain/enums/audit-action-type.enum.js';

const AUDIT_LOG_CATEGORIES = [
	'users',
	'access-groups',
	'customers',
	'stores',
	'cars',
	'vehicles',
	'leads',
	'deals',
	'teams',
] as const;

type AuditLogCategory = (typeof AUDIT_LOG_CATEGORIES)[number];

const AUDIT_LOG_CATEGORY_ENTITY_NAMES: Record<AuditLogCategory, string> = {
	'access-groups': 'AccessGroup',
	cars: 'Vehicle',
	customers: 'Customer',
	deals: 'Deal',
	leads: 'Lead',
	stores: 'Store',
	teams: 'Team',
	users: 'User',
	vehicles: 'Vehicle',
};

type AuditLogListQuery = {
	readonly page: number;
	readonly limit: number;
	readonly category?: AuditLogCategory;
	readonly action?: AuditActionType;
	readonly user?: string;
	readonly startDate?: Date;
	readonly endDate?: Date;
};

type AuditLogListPage = {
	readonly items: readonly AuditLog[];
	readonly page: number;
	readonly limit: number;
	readonly total: number;
	readonly totalPages: number;
};

/**
 * Persistence port for {@link AuditLog} (diagram: IAuditLogRepository).
 */
interface IAuditLogRepository {
	create(log: AuditLog): Promise<AuditLog>;
	listPaged(query: AuditLogListQuery): Promise<AuditLogListPage>;
}

export { AUDIT_LOG_CATEGORIES, AUDIT_LOG_CATEGORY_ENTITY_NAMES };
export type {
	AuditLogCategory,
	AuditLogListPage,
	AuditLogListQuery,
	IAuditLogRepository,
};
