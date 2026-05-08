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

import { registerSchema } from '../schemas/register.schema';
import type { RegisterInput } from '../types/auth-forms.types';
import { AuthAccentLink } from './AuthAccentLink';
import { AuthScreenLayout } from './AuthScreenLayout';
import { AuthToast } from './AuthToast';

const registerFieldClass =
	'h-10 rounded-md border-border bg-card px-3 text-[0.85rem] text-foreground shadow-none placeholder:text-muted-foreground/80 focus-visible:border-primary/45';

function RegisterForm() {
	const [toastVisible, setToastVisible] = useState(false);
	const form = useForm<RegisterInput>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const handleSubmit = form.handleSubmit(() => {
		setToastVisible(true);
	});

	return (
		<AuthScreenLayout
			asideTitle="Solicite seu acesso e entre com contexto total do funil comercial."
			overlay={
				toastVisible ? (
					<AuthToast
						description="O cadastro self-service ainda não está disponível nesta etapa. Solicite a criação da conta ao administrador do sistema."
						onClose={() => setToastVisible(false)}
						title="Cadastro indisponível"
						variant="warning"
					/>
				) : null
			}
			subtitle="Preencha os dados para solicitar seu acesso"
			title="Criar conta"
		>
			<form className="w-full space-y-4" noValidate onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label
							className="text-[0.82rem] font-normal text-muted-foreground"
							htmlFor="name"
						>
							Nome completo*
						</Label>
						<Input
							autoComplete="name"
							className={cn(
								registerFieldClass,
								form.formState.errors.name
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="name"
							placeholder="Digite seu nome"
							type="text"
							{...form.register('name')}
						/>
						{form.formState.errors.name ? (
							<p className="inline-flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="size-4" />
								{form.formState.errors.name.message}
							</p>
						) : null}
					</div>

					<div className="space-y-1.5">
						<Label
							className="text-[0.82rem] font-normal text-muted-foreground"
							htmlFor="email"
						>
							E-mail*
						</Label>
						<Input
							autoComplete="email"
							className={cn(
								registerFieldClass,
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

					<div className="space-y-1.5">
						<Label
							className="text-[0.82rem] font-normal text-muted-foreground"
							htmlFor="password"
						>
							Senha*
						</Label>
						<Input
							autoComplete="new-password"
							className={cn(
								registerFieldClass,
								form.formState.errors.password
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="password"
							placeholder="Crie uma senha"
							type="password"
							{...form.register('password')}
						/>
						{form.formState.errors.password ? (
							<p className="inline-flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="size-4" />
								{form.formState.errors.password.message}
							</p>
						) : null}
					</div>

					<div className="space-y-1.5">
						<Label
							className="text-[0.82rem] font-normal text-muted-foreground"
							htmlFor="confirmPassword"
						>
							Confirmar senha*
						</Label>
						<Input
							autoComplete="new-password"
							className={cn(
								registerFieldClass,
								form.formState.errors.confirmPassword
									? 'border-destructive focus-visible:border-destructive'
									: null,
							)}
							id="confirmPassword"
							placeholder="Repita a senha"
							type="password"
							{...form.register('confirmPassword')}
						/>
						{form.formState.errors.confirmPassword ? (
							<p className="inline-flex items-center gap-2 text-sm text-destructive">
								<AlertCircle className="size-4" />
								{form.formState.errors.confirmPassword.message}
							</p>
						) : null}
					</div>
				</div>

				<Button
					className="h-9 w-full rounded-md bg-primary text-[0.85rem] font-medium text-primary-foreground shadow-none hover:bg-primary/90"
					type="submit"
				>
					Solicitar acesso
				</Button>

				<p className="text-center text-[0.82rem]">
					<span className="text-muted-foreground">Já tem uma conta? </span>
					<AuthAccentLink
						className="inline-block whitespace-nowrap text-[0.82rem] font-medium"
						href={appRoutes.auth.login}
					>
						Entrar
					</AuthAccentLink>
				</p>
			</form>
		</AuthScreenLayout>
	);
}

export { RegisterForm };
