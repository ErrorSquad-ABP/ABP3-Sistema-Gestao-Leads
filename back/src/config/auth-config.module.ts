import { Global, Module } from '@nestjs/common';

import { assertAuthKeysConfigured, loadAuthConfig } from './auth.config.js';
import { AUTH_CONFIG } from './auth-injection.token.js';

/**
 * Carrega e exporta `AUTH_CONFIG` uma única vez (evita múltiplos `loadAuthConfig()` espalhados).
 */
@Global()
@Module({
	providers: [
		{
			provide: AUTH_CONFIG,
			useFactory: () => {
				const c = loadAuthConfig();
				assertAuthKeysConfigured(c);
				return c;
			},
		},
	],
	exports: [AUTH_CONFIG],
})
class AuthConfigModule {}

export { AuthConfigModule };
