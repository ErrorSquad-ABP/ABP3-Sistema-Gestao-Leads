import 'reflect-metadata';

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException, ParseUUIDPipe } from '@nestjs/common';

import { AgendaController } from './agenda.controller.js';
import { LeadAgendaController } from './lead-agenda.controller.js';

const ROUTE_ARGS_METADATA = '__routeArguments__';

type RouteParamMetadata = {
	data?: unknown;
	pipes?: readonly unknown[];
};

function hasParseUuidPipe(
	controller: Function,
	methodName: string,
	paramName: string,
): boolean {
	const metadata =
		(Reflect.getMetadata(
			ROUTE_ARGS_METADATA,
			controller,
			methodName,
		) as Record<string, RouteParamMetadata> | undefined) ?? {};

	return Object.values(metadata).some(
		(entry) =>
			entry.data === paramName &&
			entry.pipes?.some(
				(pipe) => pipe === ParseUUIDPipe || pipe instanceof ParseUUIDPipe,
			),
	);
}

describe('agenda route params', () => {
	it('validates agenda item id params with ParseUUIDPipe', () => {
		for (const methodName of ['update', 'done', 'cancel']) {
			assert.equal(
				hasParseUuidPipe(AgendaController, methodName, 'id'),
				true,
			);
		}
	});

	it('validates lead agenda params with ParseUUIDPipe', () => {
		assert.equal(
			hasParseUuidPipe(LeadAgendaController, 'list', 'leadId'),
			true,
		);
	});

	it('rejects invalid route UUID params as Bad Request', async () => {
		const pipe = new ParseUUIDPipe();

		await assert.rejects(
			() =>
				pipe.transform('not-a-uuid', {
					data: 'id',
					metatype: String,
					type: 'param',
				}),
			BadRequestException,
		);
	});
});
