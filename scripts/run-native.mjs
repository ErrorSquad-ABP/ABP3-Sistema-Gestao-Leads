import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import './ensure-back-env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const useLocalDb = process.argv.includes('--local');

const LOCAL_DATABASE_URL =
	'postgresql://abp:abp@127.0.0.1:5433/lead_management';

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function npmRunDev(workspace, extraEnv = {}) {
	return spawn(npmCmd, ['run', 'dev', '-w', workspace], {
		cwd: root,
		env: { ...process.env, ...extraEnv },
		stdio: 'inherit',
		shell: isWin,
	});
}

console.log(
	useLocalDb
		? '[native:local] Back usa Postgres em 127.0.0.1:5433 (instale localmente ou: npm run db:up)'
		: '[native:remote] Back usa DATABASE_URL de back/.env (ex.: Neon)',
);
console.log('Front: http://localhost:3000 | Back: http://localhost:3001');
console.log('Ctrl+C encerra back e front.\n');

const backEnv = useLocalDb ? { DATABASE_URL: LOCAL_DATABASE_URL } : {};
const children = [npmRunDev('back', backEnv), npmRunDev('front')];

let shuttingDown = false;

function shutdown(code = 0) {
	if (shuttingDown) {
		return;
	}
	shuttingDown = true;
	for (const child of children) {
		if (!child.killed) {
			child.kill('SIGTERM');
		}
	}
	setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

for (const child of children) {
	child.on('exit', (code, signal) => {
		if (shuttingDown) {
			return;
		}
		if (signal === 'SIGTERM' || signal === 'SIGINT') {
			return;
		}
		if (code && code !== 0) {
			shutdown(code);
		}
	});
}
