/**
 * Rotas de documentação (prefixo global `/api`). Evita `includes()` amplo em paths.
 */
function isOpenDocumentationPath(path: string): boolean {
	const p = path.split('?')[0] ?? path;
	if (p === '/api/docs' || p === '/api/docs-json') {
		return true;
	}
	if (p.startsWith('/api/docs/')) {
		return true;
	}
	if (p === '/api/scalar' || p.startsWith('/api/scalar/')) {
		return true;
	}
	return false;
}

export { isOpenDocumentationPath };
