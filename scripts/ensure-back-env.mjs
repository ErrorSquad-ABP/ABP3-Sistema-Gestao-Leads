import { accessSync } from 'node:fs';
import path from 'node:path';

const envPath = path.resolve(process.cwd(), 'back', '.env');

try {
	accessSync(envPath);
} catch {
	console.error(
		'Arquivo back/.env ausente. Copie o exemplo antes de subir o projeto:',
	);
	console.error('  cp back/.env.example back/.env');
	console.error(
		'Preencha DATABASE_URL, chaves JWT e FRONTEND_ORIGINS conforme o modo escolhido.',
	);
	console.error('Guia: docs/runbooks/local-setup.md');
	process.exit(1);
}
