#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { generateKeyPairSync } from 'node:crypto';
import { resolve } from 'node:path';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
	modulusLength: 2048,
	publicKeyEncoding: { type: 'spki', format: 'pem' },
	privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

/** Uma linha no .env; `auth.config` faz replace de `\n` literal → quebra de linha PEM. */
function pemToEnvLine(pem) {
	return pem
		.trim()
		.split(/\r?\n/)
		.join('\\n');
}

const outPath = resolve(import.meta.dirname, '../../.env.docker-jwt-test');
const body = [
	`JWT_ACCESS_PRIVATE_KEY=${pemToEnvLine(privateKey)}`,
	`JWT_ACCESS_PUBLIC_KEY=${pemToEnvLine(publicKey)}`,
	'',
].join('\n');

writeFileSync(outPath, body, 'utf8');
console.log(`Escrito: ${outPath}`);
