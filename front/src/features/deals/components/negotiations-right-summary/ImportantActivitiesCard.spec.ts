import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ImportantActivitiesCard } from './ImportantActivitiesCard';

const noop = () => undefined;

function renderCard(
	props: Partial<Parameters<typeof ImportantActivitiesCard>[0]> = {},
): string {
	return renderToStaticMarkup(
		createElement(ImportantActivitiesCard, {
			items: [],
			onRetry: noop,
			status: 'loading',
			...props,
		}),
	);
}

describe('ImportantActivitiesCard', () => {
	it('renders loading state without mock activities', () => {
		const html = renderCard({ status: 'loading' });

		assert.match(html, /Carregando atividades/);
		assert.doesNotMatch(html, /Follow-up|Demonstração|mock/i);
	});

	it('renders empty state honestly', () => {
		const html = renderCard({ status: 'empty' });

		assert.match(html, /Sem atividades próximas/);
		assert.match(
			html,
			/Os próximos compromissos aparecerão aqui automaticamente/,
		);
	});

	it('renders error state with retry action', () => {
		const html = renderCard({ status: 'error' });

		assert.match(html, /Não foi possível carregar a agenda agora/);
		assert.match(html, /Tentar novamente/);
	});

	it('renders internal agenda items without external links', () => {
		const html = renderCard({
			status: 'ready',
			items: [
				{
					id: 'item-1',
					type: 'EVENT',
					status: 'SCHEDULED',
					recurrence: 'NONE',
					title: 'Reunião com cliente',
					startsAt: '2026-05-30T14:00:00.000Z',
					endsAt: '2026-05-30T15:00:00.000Z',
					dueAt: null,
					location: 'Loja Centro',
					description: null,
					createdAt: '2026-05-29T14:00:00.000Z',
					updatedAt: '2026-05-29T14:00:00.000Z',
				},
			],
		});

		assert.match(html, /Reunião com cliente/);
		assert.match(html, /Loja Centro/);
		assert.doesNotMatch(html, /target="_blank"/);
		assert.doesNotMatch(html, /dangerouslySetInnerHTML/);
	});
});
