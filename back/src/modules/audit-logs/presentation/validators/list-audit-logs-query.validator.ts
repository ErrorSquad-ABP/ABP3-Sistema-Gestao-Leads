import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsDateString,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from 'class-validator';

import {
	AUDIT_ACTION_TYPES,
	type AuditActionType,
} from '../../../../shared/domain/enums/audit-action-type.enum.js';
import {
	AUDIT_LOG_CATEGORIES,
	type AuditLogCategory,
} from '../../domain/repositories/audit-log.repository.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

class ListAuditLogsQueryValidator {
	@ApiPropertyOptional({
		description: 'Pagina (base 1).',
		default: DEFAULT_PAGE,
		minimum: 1,
		example: DEFAULT_PAGE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = DEFAULT_PAGE;

	@ApiPropertyOptional({
		description: 'Itens por pagina (maximo 100).',
		default: DEFAULT_LIMIT,
		minimum: 1,
		maximum: MAX_LIMIT,
		example: DEFAULT_LIMIT,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_LIMIT)
	limit: number = DEFAULT_LIMIT;

	@ApiPropertyOptional({
		description:
			'Categoria/dominio auditado. Ex.: cars ou vehicles para veiculos, deals para negociacoes.',
		enum: AUDIT_LOG_CATEGORIES,
		example: 'cars',
	})
	@IsOptional()
	@IsIn(AUDIT_LOG_CATEGORIES)
	category?: AuditLogCategory;

	@ApiPropertyOptional({
		description:
			'Acao auditada. Use CREATE para criacao, UPDATE para edicao e DELETE para exclusao.',
		enum: AUDIT_ACTION_TYPES,
		example: 'CREATE',
	})
	@IsOptional()
	@IsIn(AUDIT_ACTION_TYPES)
	action?: AuditActionType;

	@ApiPropertyOptional({
		description:
			'Alias de `action`, mantido para telas que chamem o filtro de tipo.',
		enum: AUDIT_ACTION_TYPES,
		example: 'DELETE',
	})
	@IsOptional()
	@IsIn(AUDIT_ACTION_TYPES)
	type?: AuditActionType;

	@ApiPropertyOptional({
		description:
			'Pesquisa por usuario responsavel pelo log. Busca por nome, e-mail ou ID.',
		example: 'ana@empresa.com',
		maxLength: 120,
	})
	@IsOptional()
	@IsString()
	@MaxLength(120)
	user?: string;

	@ApiPropertyOptional({
		description:
			'Inicio do periodo pesquisado. Aceita data ISO ou data/hora ISO.',
		example: '2026-06-01T00:00:00.000Z',
	})
	@IsOptional()
	@IsDateString()
	startDate?: string;

	@ApiPropertyOptional({
		description: 'Fim do periodo pesquisado. Aceita data ISO ou data/hora ISO.',
		example: '2026-06-08T23:59:59.999Z',
	})
	@IsOptional()
	@IsDateString()
	endDate?: string;
}

export { ListAuditLogsQueryValidator };
