'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { forgotPasswordSchema } from '../schemas/forgot-password.schema';
import type { ForgotPasswordInput } from '../types/auth-forms.types';
import { AuthAccentLink } from './AuthAccentLink';
import { AuthScreenLayout } from './AuthScreenLayout';
import { AuthToast } from './AuthToast';

function ForgotPasswordForm() {
	const [toastVisible, setToastVisible] = useState(false);
	const form = useForm<ForgotPasswordInput>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const handleSubmit = form.handleSubmit(() => {
		setToastVisible(true);
	});

	return (
		<AuthScreenLayout
			asideTitle="Recupere seu acesso e volte rapidamente para a operação."
			overlay={
				toastVisible ? (
					<AuthToast
						description="A recuperação automática de senha ainda não está disponível nesta etapa. Solicite o reset ao administrador responsável."
						onClose={() => setToastVisible(false)}
						title="Fluxo indisponível"
						variant="warning"
					/>
				) : null
			}
			subtitle="Informe o seu e-mail para continuar"
			title="Esqueceu a senha?"
		>
			<form className="w-full space-y-4" noValidate onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label
							className="text-[0.82rem] font-normal text-[#6b7687]"
							htmlFor="email"
						>
							E-mail*
						</Label>
						<Input
							autoComplete="email"
							className={cn(
								'h-10 rounded-md border-[#d6dce5] bg-white px-3 text-[0.85rem] text-[#1b2430] shadow-none placeholder:text-[#97a2b1] focus-visible:border-[#2d3648]/45',
								form.formState.errors.email
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="email"
							inputMode="email"
							placeholder="exemplo@leadcrm.com"
							type="email"
							{...form.register('email')}
						/>
						{form.formState.errors.email ? (
							<p className="inline-flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="size-4" />
								{form.formState.errors.email.message}
							</p>
						) : null}
					</div>
				</div>

				<Button
					className="h-9 w-full rounded-md bg-[#2D3648] text-[0.85rem] font-medium text-white shadow-none hover:bg-[#232B3B]"
					type="submit"
				>
					Enviar instruções
				</Button>

				<p className="text-center text-[0.82rem]">
					<span className="text-[#6b7687]">Lembrou da senha? </span>
					<AuthAccentLink
						className="inline-block whitespace-nowrap text-[0.82rem] font-medium"
						href={appRoutes.auth.login}
					>
						Voltar para entrar
					</AuthAccentLink>
				</p>
			</form>
		</AuthScreenLayout>
	);
}

export { ForgotPasswordForm };
