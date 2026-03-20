import { readFileSync } from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const runtimeDependencyGroups = [
	['dependencies', packageJson.dependencies ?? {}],
	['optionalDependencies', packageJson.optionalDependencies ?? {}],
	['peerDependencies', packageJson.peerDependencies ?? {}],
];

const violations = runtimeDependencyGroups
	.filter(([, deps]) => Object.keys(deps).length > 0)
	.map(([group, deps]) => `${group}: ${Object.keys(deps).join(', ')}`);

if (violations.length > 0) {
	console.error(
		'O package.json da raiz deve conter apenas tooling e orquestracao do monorepo.',
	);
	console.error('Dependencias de runtime devem ficar em front/ ou back/.');
	console.error('Violacoes encontradas:');

	for (const violation of violations) {
		console.error(`- ${violation}`);
	}

	process.exit(1);
}

console.log(
	'Root package guard aprovado: sem dependencias de runtime na raiz.',
);
