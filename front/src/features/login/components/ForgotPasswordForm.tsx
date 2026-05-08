import { Headset, ShieldCheck, UserRoundCog } from 'lucide-react';

import { appRoutes } from '@/lib/routes/app-routes';
import { AuthAccentLink } from './AuthAccentLink';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { LoginScreenLayout } from './LoginScreenLayout';

function ForgotPasswordForm() {
	return (
		<LoginScreenLayout headline="Regularize o acesso à operação com apoio do administrador responsável.">
			<Card className="rounded-[1.5rem] border-0 bg-card shadow-[0_24px_70px_-60px_var(--ring)]">
				<CardHeader className="items-center gap-2 pb-4 text-center">
					<CardTitle className="text-[1.35rem] font-semibold tracking-tight text-foreground">
						Recuperação de acesso
					</CardTitle>
					<CardDescription className="text-[0.88rem]">
						Siga as orientações abaixo para recuperar o acesso
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-5">
					<div className="space-y-1">
						<p className="text-sm font-medium text-foreground">
							Este ambiente não envia e-mails de redefinição automaticamente.
						</p>
						<p className="text-[0.82rem] leading-6 text-muted-foreground">
							O acesso é regularizado manualmente por um administrador ou pelo
							suporte responsável pelo sistema.
						</p>
					</div>

					<div className="space-y-3">
						<div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
							<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/40">
								<UserRoundCog
									aria-hidden="true"
									className="size-4 text-[color:var(--sidebar-accent-foreground)]"
								/>
							</div>
							<div className="min-w-0">
								<p className="text-[0.84rem] font-medium text-foreground">
									1. Separe o e-mail usado no acesso
								</p>
								<p className="mt-1 text-[0.8rem] leading-6 text-muted-foreground">
									Informe ao administrador o e-mail vinculado à sua conta para
									que ele localize o utilizador correto.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
							<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/40">
								<ShieldCheck
									aria-hidden="true"
									className="size-4 text-[color:var(--sidebar-accent-foreground)]"
								/>
							</div>
							<div className="min-w-0">
								<p className="text-[0.84rem] font-medium text-foreground">
									2. Solicite a regularização do acesso
								</p>
								<p className="mt-1 text-[0.8rem] leading-6 text-muted-foreground">
									O administrador poderá redefinir a credencial ou orientar o
									próximo passo conforme o perfil da sua conta.
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3">
							<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/40">
								<Headset
									aria-hidden="true"
									className="size-4 text-[color:var(--sidebar-accent-foreground)]"
								/>
							</div>
							<div className="min-w-0">
								<p className="text-[0.84rem] font-medium text-foreground">
									3. Se necessário, acione o suporte interno
								</p>
								<p className="mt-1 text-[0.8rem] leading-6 text-muted-foreground">
									Caso não saiba quem administra o sistema, procure o
									responsável da operação ou o canal interno de suporte da sua
									equipe.
								</p>
							</div>
						</div>
					</div>

					<p className="border-t border-border pt-4 text-center text-[0.82rem]">
						<span className="text-muted-foreground">Lembrou da senha? </span>
						<AuthAccentLink
							className="inline-block whitespace-nowrap text-[0.82rem] font-medium"
							href={appRoutes.auth.login}
						>
							Voltar para entrar
						</AuthAccentLink>
					</p>
				</CardContent>
			</Card>
		</LoginScreenLayout>
	);
}

export { ForgotPasswordForm };
