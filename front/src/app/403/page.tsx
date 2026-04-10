import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

function ForbiddenPage() {
	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<Card className="w-full max-w-xl bg-white">
				<CardHeader className="space-y-3">
					<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#D96C3F]">
						Acesso negado
					</p>
					<CardTitle>Você não tem permissão para acessar esta área.</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
					<p>
						A área solicitada exige uma sessão válida e um papel compatível com
						o destino acessado.
					</p>
					<div className="flex flex-wrap gap-3">
						<Link
							className={cn(buttonVariants(), 'h-10 rounded-md px-4')}
							href={appRoutes.auth.login}
						>
							Ir para login
						</Link>
						<Link
							className={cn(
								buttonVariants({ variant: 'secondary' }),
								'h-10 rounded-md px-4',
							)}
							href={appRoutes.app.root}
						>
							Voltar ao início autenticado
						</Link>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

export default ForbiddenPage;
