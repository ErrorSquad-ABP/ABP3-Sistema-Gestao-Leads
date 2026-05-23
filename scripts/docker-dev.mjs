import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import './ensure-back-env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const useLocalDb = process.argv.includes('--local');

const files = ['docker-compose.yml', 'docker-compose.dev.yml'];
if (useLocalDb) {
	files.push('docker-compose.postgres.yml', 'docker-compose.local.yml');
}

const args = [
	'compose',
	...files.flatMap((file) => ['-f', file]),
	'up',
	'--build',
];

console.log(
	useLocalDb
		? '[docker:local] Postgres no Compose + back/front com hot reload'
		: '[docker:remote] back/.env (Neon ou remoto) — não use localhost:5433 no .env',
);
console.log(`> docker ${args.join(' ')}\n`);

const child = spawn('docker', args, {
	cwd: root,
	stdio: 'inherit',
	shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
