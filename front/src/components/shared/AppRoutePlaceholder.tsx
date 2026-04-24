import { ArrowUpRight, LayoutPanelTop, Sparkles } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type AppRoutePlaceholderProps = {
	title: string;
	description: string;
};

function AppRoutePlaceholder({ title, description }: AppRoutePlaceholderProps) {
	return (
		<section className="space-y-6">
			<Card className="border-border/80 bg-white">
				<CardHeader className="gap-4 pb-5">
					<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
						<LayoutPanelTop className="size-5" />
					</div>
					<div className="space-y-2">
						<CardTitle className="text-[1.85rem] font-semibold tracking-tight">
							{title}
						</CardTitle>
						<CardDescription className="max-w-3xl text-[0.95rem] leading-7">
							{description}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.7fr)]">
					<div className="rounded-2xl border border-border/80 bg-background/70 p-5 text-sm leading-7 text-muted-foreground">
						O login e o bootstrap inicial de sessão já estão ativos. Esta rota
						continua como placeholder funcional dentro do AppShell, para receber
						as telas definitivas da próxima fatia sem perder a consistência da
						navegação autenticada.
					</div>

					<div className="grid gap-3">
						<div className="rounded-2xl border border-border/80 bg-white p-4">
							<div className="flex items-center gap-2 text-sm font-medium text-foreground">
								<Sparkles className="size-4 text-[#d96c3f]" />
								Próxima camada
							</div>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								O módulo já está encaixado na navegação principal, pronto para
								receber tabela, filtros e estados reais.
							</p>
						</div>

						<div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
							<ArrowUpRight className="size-4 text-[#d96c3f]" />
							Destino autenticado preparado para as próximas telas.
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}

export { AppRoutePlaceholder };
