import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ConvertLeadUseCase } from '../../application/use-cases/convert-lead.use-case.js';
import { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case.js';
import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case.js';
import { FindLeadUseCase } from '../../application/use-cases/find-lead.use-case.js';
import { ListOwnLeadsUseCase } from '../../application/use-cases/list-own-leads.use-case.js';
import { ListTeamLeadsUseCase } from '../../application/use-cases/list-team-leads.use-case.js';
import { ReassignLeadUseCase } from '../../application/use-cases/reassign-lead.use-case.js';
import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case.js';
import { LeadPresenter } from '../presenters/lead.presenter.js';
import { CreateLeadValidator } from '../validators/create-lead.validator.js';
import { ReassignLeadValidator } from '../validators/reassign-lead.validator.js';
import { UpdateLeadValidator } from '../validators/update-lead.validator.js';

@ApiTags('leads')
@Controller('leads')
class LeadController {
	constructor(
		private readonly createLeadUseCase: CreateLeadUseCase,
		private readonly updateLeadUseCase: UpdateLeadUseCase,
		private readonly findLeadUseCase: FindLeadUseCase,
		private readonly listOwnLeadsUseCase: ListOwnLeadsUseCase,
		private readonly listTeamLeadsUseCase: ListTeamLeadsUseCase,
		private readonly reassignLeadUseCase: ReassignLeadUseCase,
		private readonly convertLeadUseCase: ConvertLeadUseCase,
		private readonly deleteLeadUseCase: DeleteLeadUseCase,
	) {}

	@Post()
	@ApiOperation({ summary: 'Criar lead' })
	@ApiResponse({ status: 201, description: 'Lead criado com sucesso' })
	async create(@Body() body: CreateLeadValidator) {
		const lead = await this.createLeadUseCase.execute(body);
		return LeadPresenter.toResponse(lead);
	}

	@Get('owner/:ownerUserId')
	@ApiOperation({ summary: 'Listar leads por owner' })
	listByOwner(@Param('ownerUserId', ParseUUIDPipe) ownerUserId: string) {
		return this.listOwnLeadsUseCase
			.execute(ownerUserId)
			.then((leads) => LeadPresenter.toResponseList(leads));
	}

	@Get('team/:teamId')
	@ApiOperation({ summary: 'Listar leads por team' })
	listByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
		return this.listTeamLeadsUseCase
			.execute(teamId)
			.then((leads) => LeadPresenter.toResponseList(leads));
	}

	@Get(':id')
	@ApiOperation({ summary: 'Buscar lead por id' })
	async findById(@Param('id', ParseUUIDPipe) id: string) {
		const lead = await this.findLeadUseCase.execute(id);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Atualizar lead' })
	async update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: UpdateLeadValidator,
	) {
		const lead = await this.updateLeadUseCase.execute(id, body);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id/reassign')
	@ApiOperation({ summary: 'Reatribuir lead' })
	async reassign(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() body: ReassignLeadValidator,
	) {
		const lead = await this.reassignLeadUseCase.execute(id, body);
		return LeadPresenter.toResponse(lead);
	}

	@Patch(':id/convert')
	@ApiOperation({ summary: 'Converter lead' })
	async convert(@Param('id', ParseUUIDPipe) id: string) {
		const lead = await this.convertLeadUseCase.execute(id);
		return LeadPresenter.toResponse(lead);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Excluir lead' })
	@ApiResponse({ status: 204, description: 'Lead removido' })
	async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
		await this.deleteLeadUseCase.execute(id);
	}
}

export { LeadController };
