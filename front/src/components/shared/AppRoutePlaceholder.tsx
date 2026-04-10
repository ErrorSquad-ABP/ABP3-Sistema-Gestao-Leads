import { ArrowUpRight, ShieldCheck } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AppRoutePlaceholderProps = {
	title: string;
	description: string;
};

function AppRoutePlaceholder({
	title,
	description,
}: AppRoutePlaceholderProps) {
	return (
		<main className="flex min-h-screen items-center justify-center px-4 py-10">
			<Card className="w-full max-w-2xl bg-white/90 backdrop-blur">
				<CardHeader>
					<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
						<ShieldCheck className="size-6" />
					</div>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 text-sm text-muted-foreground">
					<div className="rounded-xl border border-border bg-background/70 p-4">
						O login e o bootstrap inicial de sessão já estão ativos. Esta rota
						foi criada para receber o redirecionamento por papel sem cair em
						`404`, enquanto o `AppShell` e as telas autenticadas ainda entram na
						próxima fatia.
					</div>
					<div className="inline-flex items-center gap-2 font-medium text-foreground">
						<ArrowUpRight className="size-4 text-primary" />
						Destino inicial preparado para a próxima etapa do frontend.
					</div>
				</CardContent>
			</Card>
		</main>
	);
}

export { AppRoutePlaceholder };
