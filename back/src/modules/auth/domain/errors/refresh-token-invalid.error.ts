class RefreshTokenInvalidError extends Error {
	readonly code = 'auth.refresh_invalid';

	constructor() {
		super('Refresh token inválido ou expirado.');
		this.name = 'RefreshTokenInvalidError';
	}
}

export { RefreshTokenInvalidError };
