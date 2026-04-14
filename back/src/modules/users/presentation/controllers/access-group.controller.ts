import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../../../shared/presentation/decorators/roles.decorator.js';
import {
	ApiCreatedResponseEnvelope,
	ApiOkResponseEnvelope,
	ApiOkResponseEnvelopeArray,
} from '../../../../shared/presentation/swagger/api-success-response.js';
import { AccessGroupSummaryDto } from '../../application/dto/access-group-summary.dto.js';
// biome-ignore lint/style/useImportType: Nest DI
import { AccessGroupsService } from '../../application/services/access-groups.service.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { CreateAccessGroupValidator } from '../validators/create-access-group.validator.js';
// biome-ignore lint/style/useImportType: validators em runtime
import { UpdateAccessGroupValidator } from '../validators/update-access-group.validator.js';

const SERVER_ERROR = {
	description:
		'Erro interno ou erro de domínio ainda não mapeado para status HTTP específico.',
};

@ApiBearerAuth()
@ApiTags('users')
@Roles('ADMINISTRATOR')
@Controller('users/access-groups')
class AccessGroupController {
	constructor(private readonly accessGroupsService: AccessGroupsService) {}

	@Get()
	@ApiOperation({
		summary: 'Listar grupos de acesso',
		description:
			'Devolve grupos canônicos e grupos customizados com suas features habilitadas.',
	})
	@ApiOkResponseEnvelopeArray(AccessGroupSummaryDto)
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async list(): Promise<AccessGroupSummaryDto[]> {
		return this.accessGroupsService.list();
	}

	@Post()
	@ApiOperation({ summary: 'Criar grupo de acesso' })
	@ApiCreatedResponseEnvelope(AccessGroupSummaryDto)
	@ApiBadRequestResponse({
		description: 'Corpo inválido ou sem features mínimas para o grupo.',
	})
	@ApiConflictResponse({
		description: 'Já existe um grupo com este nome.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async create(@Body() body: CreateAccessGroupValidator) {
		return this.accessGroupsService.create({
			name: body.name,
			description: body.description,
			baseRole: (body.baseRole ?? null) as
				| 'ATTENDANT'
				| 'MANAGER'
				| 'GENERAL_MANAGER'
				| 'ADMINISTRATOR'
				| null,
			featureKeys: body.featureKeys,
		});
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar grupo de acesso' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiOkResponseEnvelope(AccessGroupSummaryDto)
	@ApiBadRequestResponse({
		description: 'UUID inválido, corpo inválido ou payload vazio.',
	})
	@ApiConflictResponse({
		description: 'Já existe um grupo com este nome.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateAccessGroupValidator,
	) {
		return this.accessGroupsService.update(id, {
			name: body.name,
			description: body.description,
			baseRole: body.baseRole as
				| 'ATTENDANT'
				| 'MANAGER'
				| 'GENERAL_MANAGER'
				| 'ADMINISTRATOR'
				| null
				| undefined,
			featureKeys: body.featureKeys,
		});
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: 'Excluir grupo de acesso' })
	@ApiParam({ name: 'id', format: 'uuid' })
	@ApiNoContentResponse()
	@ApiBadRequestResponse({
		description: 'UUID inválido ou tentativa de remover grupo canônico.',
	})
	@ApiInternalServerErrorResponse(SERVER_ERROR)
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.accessGroupsService.delete(id);
	}
}

export { AccessGroupController };
