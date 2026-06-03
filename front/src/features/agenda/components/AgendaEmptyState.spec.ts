import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AgendaEmptyState } from './AgendaEmptyState';

describe('AgendaEmptyState', () => {
	it('uses neutral product copy', () => {
		const html = renderToStaticMarkup(createElement(AgendaEmptyState));

		assert.match(html, /Sem atividades próximas/);
		assert.match(
			html,
			/Os próximos compromissos aparecerão aqui automaticamente/,
		);
	});
});
