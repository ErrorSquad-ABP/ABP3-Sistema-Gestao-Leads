import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AgendaHeader } from './AgendaHeader';

describe('AgendaHeader', () => {
	it('renders the page title and month controls', () => {
		const html = renderToStaticMarkup(
			createElement(AgendaHeader, {
				monthLabel: 'junho de 2026',
				onCreateClick: () => undefined,
				onNextMonth: () => undefined,
				onPreviousMonth: () => undefined,
				onTodayClick: () => undefined,
			}),
		);

		assert.match(html, /Agenda/);
		assert.match(html, /junho de 2026/);
		assert.match(html, /Hoje/);
		assert.match(html, /Nova atividade/);
	});
});
