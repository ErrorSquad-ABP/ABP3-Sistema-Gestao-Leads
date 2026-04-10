import { z } from 'zod';

const registerSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(3, 'Informe o nome completo com pelo menos 3 caracteres.'),
		email: z.email('Informe um e-mail válido.'),
		password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
		confirmPassword: z.string().min(1, 'Confirme a senha informada.'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'As senhas informadas precisam ser iguais.',
		path: ['confirmPassword'],
	});

export { registerSchema };
