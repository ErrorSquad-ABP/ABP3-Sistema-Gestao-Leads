#!/usr/bin/env node
/**
 * Bateria local de verificações de segurança e qualidade relacionada.
 * Uso: na raiz do repositório, `node scripts/security-check.mjs`
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';

function run(title, command, args, options = {}) {
	console.log(`\n── ${title} ──`);
	const r = spawnSync(command, args, {
		stdio: 'inherit',
		shell: process.platform === 'win32',
		cwd: options.cwd ?? process.cwd(),
	});
	const code = r.status ?? 1;
	if (code !== 0) {
		console.error(`\n[FALHA] ${title} (exit ${code})`);
		process.exit(code);
	}
}

console.log('\n── npm audit (relatório; não bloqueia o script) ──');
const auditReport = spawnSync('npm', ['audit', '--workspaces'], {
	stdio: 'inherit',
	shell: process.platform === 'win32',
});
if (auditReport.status !== 0) {
	console.warn(
		'\n[AVISO] npm audit encontrou issues (transitivas comuns em Nest). Corrija com updates/overrides quando houver fix estável.',
	);
}

run('npm audit severidade ≥ crítica (falha se existir)', 'npm', [
	'audit',
	'--workspaces',
	'--audit-level=critical',
]);

run('Testes unitários back', 'npm', ['run', 'test', '-w', 'back']);

run('Quality gate (format, Biome, typecheck, ESLint security, build)', 'npm', [
	'run',
	'quality:gate:blocking',
]);

console.log('\nSecurity check concluído: audit + testes + eslint + gate OK.');
