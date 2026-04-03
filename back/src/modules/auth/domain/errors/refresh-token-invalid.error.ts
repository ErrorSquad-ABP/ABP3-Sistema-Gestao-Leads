class RefreshTokenInvalidError extends Error {
	readonly code = 'auth.refresh_invalid';

	constructor(message = 'Refresh token inválido ou expirado.') {
		super(message);
		this.name = 'RefreshTokenInvalidError';
	}
}

export { RefreshTokenInvalidError };
