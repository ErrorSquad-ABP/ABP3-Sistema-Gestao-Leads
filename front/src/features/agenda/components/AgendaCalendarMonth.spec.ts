import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AgendaCalendarMonth, type CalendarDay } from './AgendaCalendarMonth';

const DAYS: CalendarDay[] = [
	{
		date: new Date('2026-06-03T12:00:00.000Z'),
		isCurrentMonth: true,
		isSelected: true,
		isToday: true,
		items: [],
		key: '2026-06-03',
	},
];

describe('AgendaCalendarMonth', () => {
	it('renders day creation affordance with accessible label', () => {
		const html = renderToStaticMarkup(
			createElement(AgendaCalendarMonth, {
				days: DAYS,
				onCreateDate: noop,
				onSelectDate: noop,
			}),
		);

		assert.match(html, /Calendário mensal/);
		assert.match(html, /Criar atividade em/);
		assert.match(html, /Selecionar dia 3/);
	});
});

function noop() {
	return undefined;
}
