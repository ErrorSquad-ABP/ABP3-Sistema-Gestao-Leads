import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
	path.join(root, 'front', '.next'),
	path.join(root, 'back', 'dist'),
];

for (const target of targets) {
	try {
		rmSync(target, { recursive: true, force: true });
		console.log(`[clean] removido: ${path.relative(root, target)}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[clean] falhou em ${target}: ${message}`);
		console.error(
			'Se aparecer EACCES, rode: sudo chown -R $USER:$USER front/.next && npm run clean:dev',
		);
		process.exit(1);
	}
}

console.log(
	'\nCache de dev limpo. Suba de novo com start:native:* ou start:docker:*.',
);
