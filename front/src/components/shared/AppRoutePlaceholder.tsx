import { ArrowRight, LayoutPanelLeft, ShieldCheck } from 'lucide-react';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type AppRoutePlaceholderProps = {
	description: string;
	eyebrow?: string;
	highlights?: readonly string[];
	nextStep?: string;
	title: string;
};

function AppRoutePlaceholder({
	description,
	eyebrow = 'Area protegida',
	highlights = [],
	nextStep = 'Shell autenticado pronto para receber a proxima etapa deste modulo.',
	title,
}: AppRoutePlaceholderProps) {
	return (
		<div className="space-y-6">
			<section className="space-y-3">
				<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D96C3F]">
					{eyebrow}
				</p>
				<div className="space-y-2">
					<h1 className="text-3xl font-semibold tracking-tight text-foreground">
						{title}
					</h1>
					<p className="max-w-3xl text-sm leading-6 text-muted-foreground">
						{description}
					</p>
				</div>
			</section>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.95fr)]">
				<Card className="border-white/70 bg-white/90 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)]">
					<CardHeader>
						<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-[#D96C3F]">
							<ShieldCheck className="size-6" />
						</div>
						<CardTitle>{title}</CardTitle>
						<CardDescription>
							Este destino ja faz parte da area autenticada minima da Sprint 1.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 text-sm text-muted-foreground">
						<div className="rounded-2xl border border-border/70 bg-[#F7F8FA] p-4 leading-6">
							O acesso, o redirecionamento inicial por perfil e a navegacao
							protegida ja estao preparados. A proxima entrega pode focar direto
							na regra de negocio e nos formularios do modulo.
						</div>
						{highlights.length > 0 ? (
							<div className="grid gap-3 md:grid-cols-2">
								{highlights.map((highlight) => (
									<div
										className="rounded-2xl border border-border/70 bg-white p-4 text-sm leading-6 text-foreground"
										key={highlight}
									>
										{highlight}
									</div>
								))}
							</div>
						) : null}
					</CardContent>
				</Card>

				<Card className="border-[#E7D7CF] bg-[linear-gradient(180deg,#FFF8F3_0%,#FFFFFF_100%)]">
					<CardHeader>
						<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#2D3648] shadow-sm">
							<LayoutPanelLeft className="size-5" />
						</div>
						<CardTitle className="text-xl">Proximo passo</CardTitle>
						<CardDescription>{nextStep}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm leading-6 text-[#4B5565]">
						<div className="inline-flex items-start gap-2 rounded-2xl border border-[#F0DED3] bg-white/90 p-4">
							<ArrowRight
								aria-hidden="true"
								className="mt-1 size-4 shrink-0 text-[#D96C3F]"
							/>
							<p>
								A estrutura visual, a navegacao lateral e o contexto do usuario
								ja estao disponiveis para a proxima historia ligada a este
								modulo.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export { AppRoutePlaceholder };
