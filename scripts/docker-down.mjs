import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const useLocalDb = process.argv.includes('--local');
const removeVolumes = process.argv.includes('--volumes');

const files = ['docker-compose.yml', 'docker-compose.dev.yml'];
if (useLocalDb) {
	files.push('docker-compose.postgres.yml', 'docker-compose.local.yml');
}

const args = [
	'compose',
	...files.flatMap((file) => ['-f', file]),
	'down',
	...(removeVolumes ? ['-v'] : []),
];

const child = spawn('docker', args, {
	cwd: root,
	stdio: 'inherit',
	shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
