type AuditLogAction =
	| 'LOGIN'
	| 'CREATE'
	| 'UPDATE'
	| 'DELETE'
	| 'STATUS_CHANGE'
	| 'STAGE_CHANGE';

type AuditLogCategory =
	| 'users'
	| 'access-groups'
	| 'customers'
	| 'stores'
	| 'cars'
	| 'vehicles'
	| 'leads'
	| 'deals'
	| 'teams';

type AuditLogActor = {
	id: string;
	name: string;
	email: string;
	role: string;
};

type AuditLogRecord = {
	id: string;
	actorUserId: string | null;
	actor: AuditLogActor | null;
	action: AuditLogAction;
	entityName: string;
	entityId: string | null;
	metadata: unknown;
	createdAt: Date;
};

type ListAuditLogsFilters = {
	category?: AuditLogCategory;
	action?: AuditLogAction;
	user?: string;
	startDate?: string;
	endDate?: string;
	page: number;
	limit: number;
};

type ListAuditLogsResponse = {
	items: AuditLogRecord[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

const auditLogActions = [
	'CREATE',
	'UPDATE',
	'DELETE',
	'STATUS_CHANGE',
	'STAGE_CHANGE',
	'LOGIN',
] as const satisfies readonly AuditLogAction[];

const auditLogCategories = [
	'users',
	'access-groups',
	'customers',
	'stores',
	'leads',
	'deals',
	'cars',
	'vehicles',
	'teams',
] as const satisfies readonly AuditLogCategory[];

const auditLogActionLabels: Record<AuditLogAction, string> = {
	CREATE: 'Criação',
	DELETE: 'Remoção',
	LOGIN: 'Login',
	STAGE_CHANGE: 'Mudança de etapa',
	STATUS_CHANGE: 'Mudança de status',
	UPDATE: 'Edição',
};

const auditLogCategoryLabels: Record<AuditLogCategory | 'all', string> = {
	all: 'Todas',
	'access-groups': 'Grupos de acesso',
	cars: 'Veículos',
	customers: 'Clientes',
	deals: 'Negociações',
	leads: 'Leads',
	stores: 'Lojas',
	teams: 'Equipes',
	users: 'Usuários',
	vehicles: 'Veículos',
};

const auditLogEntityLabels: Record<string, string> = {
	AccessGroup: 'Grupo de acesso',
	Customer: 'Cliente',
	Deal: 'Negociação',
	Lead: 'Lead',
	Store: 'Loja',
	Team: 'Equipe',
	User: 'Usuário',
	Vehicle: 'Veículo',
};

const auditLogEntityLabelsByKey: Record<string, string> = auditLogEntityLabels;

function labelFromMapOrToken(
	labels: Record<string, string>,
	value: string,
): string {
	const key = value.trim();
	const fromMap = new Map(Object.entries(labels)).get(key);
	if (fromMap !== undefined) {
		return fromMap;
	}

	return key || value;
}

function formatAuditLogEntityLabel(entityName: string): string {
	return labelFromMapOrToken(auditLogEntityLabelsByKey, entityName);
}

function getAuditLogCategoryLabel(category: AuditLogCategory | 'all'): string {
	switch (category) {
		case 'all':
			return auditLogCategoryLabels.all;
		case 'access-groups':
			return auditLogCategoryLabels['access-groups'];
		case 'cars':
			return auditLogCategoryLabels.cars;
		case 'customers':
			return auditLogCategoryLabels.customers;
		case 'deals':
			return auditLogCategoryLabels.deals;
		case 'leads':
			return auditLogCategoryLabels.leads;
		case 'stores':
			return auditLogCategoryLabels.stores;
		case 'teams':
			return auditLogCategoryLabels.teams;
		case 'users':
			return auditLogCategoryLabels.users;
		case 'vehicles':
			return auditLogCategoryLabels.vehicles;
	}
}

function getAuditLogActionLabel(action: AuditLogAction): string {
	switch (action) {
		case 'CREATE':
			return auditLogActionLabels.CREATE;
		case 'DELETE':
			return auditLogActionLabels.DELETE;
		case 'LOGIN':
			return auditLogActionLabels.LOGIN;
		case 'STAGE_CHANGE':
			return auditLogActionLabels.STAGE_CHANGE;
		case 'STATUS_CHANGE':
			return auditLogActionLabels.STATUS_CHANGE;
		case 'UPDATE':
			return auditLogActionLabels.UPDATE;
	}
}

export type {
	AuditLogAction,
	AuditLogActor,
	AuditLogCategory,
	AuditLogRecord,
	ListAuditLogsFilters,
	ListAuditLogsResponse,
};
export {
	auditLogActionLabels,
	auditLogActions,
	auditLogCategories,
	auditLogCategoryLabels,
	auditLogEntityLabels,
	formatAuditLogEntityLabel,
	getAuditLogActionLabel,
	getAuditLogCategoryLabel,
};
