import { Headset, ShieldCheck, UserRoundCog } from 'lucide-react';

import { appRoutes } from '@/lib/routes/app-routes';
import { AuthAccentLink } from './AuthAccentLink';
import { AuthScreenLayout } from './AuthScreenLayout';

function ForgotPasswordForm() {
	return (
		<AuthScreenLayout
			asideTitle="Regularize o acesso à operação com apoio do administrador responsável."
			subtitle="Siga as orientações abaixo para recuperar o acesso"
			title="Recuperação de acesso"
		>
			<div className="w-full space-y-4 rounded-2xl border border-[#d6dce5] bg-white px-5 py-5 text-[#1b2430] shadow-[0_20px_60px_-28px_rgba(15,23,42,0.16)]">
				<div className="space-y-1">
					<p className="text-sm font-medium text-[#1b2430]">
						Este ambiente não envia e-mails de redefinição automaticamente.
					</p>
					<p className="text-[0.82rem] leading-6 text-[#6b7687]">
						O acesso é regularizado manualmente por um administrador ou pelo
						suporte responsável pelo sistema.
					</p>
				</div>

				<div className="space-y-3">
					<div className="flex items-start gap-3 rounded-xl border border-[#d6dce5] bg-[#f8fafc] px-3 py-3">
						<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5ede8]">
							<UserRoundCog
								aria-hidden="true"
								className="size-4 text-[#D96C3F]"
							/>
						</div>
						<div className="min-w-0">
							<p className="text-[0.84rem] font-medium text-[#1b2430]">
								1. Separe o e-mail usado no acesso
							</p>
							<p className="mt-1 text-[0.8rem] leading-6 text-[#6b7687]">
								Informe ao administrador o e-mail vinculado à sua conta para que
								ele localize o utilizador correto.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3 rounded-xl border border-[#d6dce5] bg-[#f8fafc] px-3 py-3">
						<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5ede8]">
							<ShieldCheck
								aria-hidden="true"
								className="size-4 text-[#D96C3F]"
							/>
						</div>
						<div className="min-w-0">
							<p className="text-[0.84rem] font-medium text-[#1b2430]">
								2. Solicite a regularização do acesso
							</p>
							<p className="mt-1 text-[0.8rem] leading-6 text-[#6b7687]">
								O administrador poderá redefinir a credencial ou orientar o
								próximo passo conforme o perfil da sua conta.
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3 rounded-xl border border-[#d6dce5] bg-[#f8fafc] px-3 py-3">
						<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f5ede8]">
							<Headset aria-hidden="true" className="size-4 text-[#D96C3F]" />
						</div>
						<div className="min-w-0">
							<p className="text-[0.84rem] font-medium text-[#1b2430]">
								3. Se necessário, acione o suporte interno
							</p>
							<p className="mt-1 text-[0.8rem] leading-6 text-[#6b7687]">
								Caso não saiba quem administra o sistema, procure o responsável
								da operação ou o canal interno de suporte da sua equipe.
							</p>
						</div>
					</div>
				</div>

				<p className="border-t border-[#d6dce5] pt-4 text-center text-[0.82rem]">
					<span className="text-[#6b7687]">Lembrou da senha? </span>
					<AuthAccentLink
						className="inline-block whitespace-nowrap text-[0.82rem] font-medium"
						href={appRoutes.auth.login}
					>
						Voltar para entrar
					</AuthAccentLink>
				</p>
			</div>
		</AuthScreenLayout>
	);
}

export { ForgotPasswordForm };
