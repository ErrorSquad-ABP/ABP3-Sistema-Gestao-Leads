#!/usr/bin/env node

import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(import.meta.dirname, '..');
const schemaPath = resolve(rootDir, 'prisma/schema.prisma');
const generatedClientPath = resolve(rootDir, 'src/generated/prisma/client.ts');

function runPrismaGenerate() {
	const result = spawnSync(
		process.platform === 'win32' ? 'npx.cmd' : 'npx',
		['prisma', 'generate', '--config', 'prisma.config.ts'],
		{
			cwd: rootDir,
			stdio: 'inherit',
			env: process.env,
		},
	);

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

function tryPrismaGenerateOnStaleClient() {
	const result = spawnSync(
		process.platform === 'win32' ? 'npx.cmd' : 'npx',
		['prisma', 'generate', '--config', 'prisma.config.ts'],
		{
			cwd: rootDir,
			stdio: 'inherit',
			env: process.env,
		},
	);

	if (result.status === 0) {
		process.exit(0);
	}

	console.error(
		'[prisma] Generated client is stale and automatic regeneration failed. Run `npm run prisma:generate:force -w back` before typecheck/build.',
	);
	process.exit(result.status ?? 1);
}

if (process.env.PRISMA_FORCE_GENERATE === '1') {
	runPrismaGenerate();
	process.exit(0);
}

if (!existsSync(generatedClientPath)) {
	console.log('[prisma] Generated client not found, running prisma generate.');
	runPrismaGenerate();
	process.exit(0);
}

const schemaMtime = statSync(schemaPath).mtimeMs;
const clientMtime = statSync(generatedClientPath).mtimeMs;

if (schemaMtime > clientMtime) {
	console.warn(
		'[prisma] Generated client is older than prisma/schema.prisma. Regenerating Prisma client.',
	);
	tryPrismaGenerateOnStaleClient();
} else {
	console.log('[prisma] Reusing generated client from src/generated/prisma.');
}
