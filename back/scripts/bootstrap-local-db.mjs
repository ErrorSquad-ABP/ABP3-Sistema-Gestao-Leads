import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import path from 'node:path';

import pg from 'pg';

const execFileAsync = promisify(execFile);
const { Client } = pg;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, '..', '..');
const seedMode = process.env.LOCAL_DB_SEED_MODE ?? 'dashboard';

async function runWorkspaceScript(script, extraEnv = {}) {
	const env = { ...process.env, ...extraEnv };
	const { stdout, stderr } = await execFileAsync(
		'/bin/sh',
		['-lc', `npm run ${script} --workspace back`],
		{
			cwd: appRoot,
			env,
			maxBuffer: 1024 * 1024 * 10,
		},
	);

	if (stdout) {
		process.stdout.write(stdout);
	}

	if (stderr) {
		process.stderr.write(stderr);
	}
}

async function shouldSeed(databaseUrl) {
	const client = new Client({ connectionString: databaseUrl });
	await client.connect();
	try {
		const result = await client.query(
			'SELECT COUNT(*)::int AS count FROM "User"',
		);
		const count = result.rows[0]?.count ?? 0;
		return count === 0;
	} finally {
		await client.end();
	}
}

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error('DATABASE_URL não definida para bootstrap local.');
	}

	console.log('[local-db] applying migrations...');
	await runWorkspaceScript('prisma:migrate:deploy');

	const seedNeeded = await shouldSeed(databaseUrl);
	if (!seedNeeded) {
		console.log('[local-db] existing data found, skipping seed.');
		return;
	}

	console.log(
		`[local-db] empty database detected, running seed (SEED_MODE=${seedMode})...`,
	);
	await runWorkspaceScript('prisma:seed', { SEED_MODE: seedMode });
}

main().catch((error) => {
	console.error('[local-db] bootstrap failed');
	console.error(error);
	process.exit(1);
});
