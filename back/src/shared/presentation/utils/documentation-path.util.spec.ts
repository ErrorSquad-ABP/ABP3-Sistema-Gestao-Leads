import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOpenDocumentationPath } from './documentation-path.util.js';

describe('isOpenDocumentationPath', () => {
	it('aceita rotas conhecidas de documentação', () => {
		assert.equal(isOpenDocumentationPath('/api/docs'), true);
		assert.equal(isOpenDocumentationPath('/api/docs-json'), true);
		assert.equal(isOpenDocumentationPath('/api/docs/swagger-ui.css'), true);
		assert.equal(isOpenDocumentationPath('/api/scalar'), true);
		assert.equal(isOpenDocumentationPath('/api/scalar/foo'), true);
	});

	it('ignora query string ao decidir', () => {
		assert.equal(isOpenDocumentationPath('/api/docs?x=1'), true);
	});

	it('não libera paths que só contêm substring por acidente', () => {
		assert.equal(isOpenDocumentationPath('/api/users'), false);
		assert.equal(isOpenDocumentationPath('/api/leads/docs-helper'), false);
		assert.equal(isOpenDocumentationPath('/api/health'), false);
	});
});
