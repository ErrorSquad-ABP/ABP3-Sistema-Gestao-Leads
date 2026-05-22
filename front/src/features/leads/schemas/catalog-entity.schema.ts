import { z } from 'zod';

const customerCatalogFormSchema = z
	.object({
		name: z.string().trim().min(1, 'Nome é obrigatório.'),
		email: z.string().trim(),
		phone: z.string().trim(),
		cpf: z.string().trim(),
	})
	.superRefine((data, ctx) => {
		if (data.email.length > 0) {
			const check = z.string().email().safeParse(data.email);
			if (!check.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ['email'],
					message: 'E-mail inválido.',
				});
			}
		}
	});

const storeCatalogFormSchema = z.object({
	name: z.string().trim().min(1, 'Nome da loja é obrigatório.'),
});

type CustomerCatalogFormValues = z.infer<typeof customerCatalogFormSchema>;
type StoreCatalogFormValues = z.infer<typeof storeCatalogFormSchema>;

export type { CustomerCatalogFormValues, StoreCatalogFormValues };
export { customerCatalogFormSchema, storeCatalogFormSchema };
