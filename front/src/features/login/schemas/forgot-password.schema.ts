import { z } from 'zod';

const forgotPasswordSchema = z.object({
	email: z.email('Informe um e-mail válido.'),
});

export { forgotPasswordSchema };
