import { createHash, randomBytes } from 'node:crypto';

/** UUID v4 (36 chars com hífens); segue o primeiro `.` no token opaco. */
const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function generateRefreshSecret(): string {
	return randomBytes(32).toString('base64url');
}

function buildRefreshToken(sessionId: string, secret: string): string {
	return `${sessionId}.${secret}`;
}

function parseRefreshToken(
	raw: string,
): { readonly sessionId: string; readonly secret: string } | null {
	const t = raw.trim();
	if (t.length < 38) {
		return null;
	}
	const dot = t.indexOf('.');
	if (dot !== 36) {
		return null;
	}
	const sessionId = t.slice(0, 36);
	if (!UUID_V4.test(sessionId)) {
		return null;
	}
	const secret = t.slice(37);
	if (secret.length < 16) {
		return null;
	}
	return { sessionId, secret };
}

function hashRefreshSecret(secret: string, pepper: string): string {
	const h = createHash('sha256');
	h.update(pepper, 'utf8');
	h.update(secret, 'utf8');
	return h.digest('hex');
}

export {
	buildRefreshToken,
	generateRefreshSecret,
	hashRefreshSecret,
	parseRefreshToken,
};
