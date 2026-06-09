import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Label } from './label';

describe('Label', () => {
	it('renders an accessible required field marker', () => {
		const html = renderToStaticMarkup(
			createElement(Label, { htmlFor: 'name', required: true }, 'Nome'),
		);

		assert.match(html, /aria-hidden="true"[^>]*>\*<\/span>/);
		assert.match(html, /\(obrigatório\)/);
	});

	it('does not render the marker for optional fields', () => {
		const html = renderToStaticMarkup(
			createElement(Label, { htmlFor: 'nickname' }, 'Apelido'),
		);

		assert.doesNotMatch(html, />\*<\/span>/);
		assert.doesNotMatch(html, /obrigatório/);
	});
});
