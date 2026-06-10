import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getInitials, TeamMemberSelector } from './TeamMemberSelector';

describe('TeamMemberSelector', () => {
	it('renderiza membros selecionados com nome e email', () => {
		const html = renderToStaticMarkup(
			createElement(TeamMemberSelector, {
				candidates: [
					{
						id: '11111111-1111-4111-8111-111111111111',
						name: 'Ana Silva',
						email: 'ana@example.com',
					},
				],
				onChange: () => {},
				selectedUserIds: ['11111111-1111-4111-8111-111111111111'],
			}),
		);

		assert.match(html, /Ana Silva/);
		assert.match(html, /ana@example\.com/);
	});

	it('calcula iniciais sem depender de avatar externo', () => {
		assert.equal(getInitials('Ana Silva'), 'AS');
		assert.equal(getInitials(''), 'US');
	});
});
