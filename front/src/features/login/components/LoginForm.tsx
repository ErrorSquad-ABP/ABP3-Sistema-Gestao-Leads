'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
	AlertCircle,
	Eye,
	EyeOff,
	LoaderCircle,
	Lock,
	Mail,
	ShieldCheck,
	WifiOff,
} from 'lucide-react';
import { startTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryKeys } from '@/lib/constants/query-keys';
import { setAccessToken } from '@/lib/auth/access-token';
import { isApiError } from '@/lib/http/api-error';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { useLoginMutation } from '../hooks/login.mutations';
import { useCurrentUserQuery } from '../hooks/login.queries';
import { loginSchema } from '../schemas/login.schema';
import type { LoginInput } from '../types/login.types';
import { AuthStatusIndicator } from './AuthStatusIndicator';
import { AuthAccentLink } from './AuthAccentLink';
import { LoginScreenLayout } from './LoginScreenLayout';

function getLoginErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir o login agora. Tente novamente em instantes.';
	}

	if (error.status === 401) {
		return 'Credenciais inválidas. Verifique o e-mail e a senha informados.';
	}

	if (error.status === 429) {
		return 'Muitas tentativas de acesso em sequência. Aguarde um momento antes de tentar novamente.';
	}

	return error.message;
}

function LoginForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const currentUserQuery = useCurrentUserQuery();
	const loginMutation = useLoginMutation();
	const currentUser = currentUserQuery.data ?? null;
	const [passwordVisible, setPasswordVisible] = useState(false);
	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	useEffect(() => {
		if (!currentUser) {
			return;
		}

		startTransition(() => {
			router.replace(appRoutes.app.root);
		});
	}, [currentUser, router]);

	const handleSubmit = form.handleSubmit(async (values) => {
		await queryClient.cancelQueries({
			queryKey: queryKeys.auth.currentUser,
		});

		try {
			const result = await loginMutation.mutateAsync(values);
			setAccessToken(result.accessToken);
			queryClient.setQueryData(queryKeys.auth.currentUser, result.user);
			startTransition(() => {
				router.replace(appRoutes.app.root);
			});
		} catch {
			// The mutation state already stores the error for the inline feedback UI.
		}
	});

	const loginErrorMessage = loginMutation.error
		? getLoginErrorMessage(loginMutation.error)
		: null;

	const sessionStatus = currentUserQuery.isPending
		? {
				id: 'validating-session',
				icon: (
					<LoaderCircle
						aria-hidden="true"
						className="size-4 animate-spin text-[#2d3648]"
					/>
				),
				label: 'Status da sessão',
				message:
					'Validando sessão existente. Se já houver uma sessão ativa, o redirecionamento será automático.',
			}
		: currentUserQuery.isError
			? {
					id: 'session-unavailable',
					icon: (
						<WifiOff aria-hidden="true" className="size-4 text-[#D96C3F]" />
					),
					label: 'Sessão indisponível',
					message:
						'Não foi possível validar a sessão atual. Você ainda pode entrar normalmente; se o problema persistir, verifique a disponibilidade da API.',
				}
			: null;

	return (
		<LoginScreenLayout
			headline="Acompanhe leads, negociações e desempenho em um só lugar."
			overlay={
				sessionStatus ? (
					<AuthStatusIndicator
						icon={sessionStatus.icon}
						id={sessionStatus.id}
						label={sessionStatus.label}
						message={sessionStatus.message}
					/>
				) : null
			}
		>
			<div className="space-y-5">
				<Card className="rounded-[1.5rem] border-0 bg-card shadow-[0_24px_70px_-60px_var(--ring)]">
					<CardHeader className="items-center gap-3 pb-4 text-center">
						<p className="text-[1.35rem] font-semibold tracking-tight text-foreground">
							Quantum CRM
						</p>
						<CardDescription className="text-[0.88rem]">
							Entre para continuar gerenciando suas oportunidades.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" noValidate onSubmit={handleSubmit}>
							{loginErrorMessage ? (
								<div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-[0.82rem] text-destructive">
									<AlertCircle
										aria-hidden="true"
										className="mt-0.5 size-4 shrink-0"
									/>
									<div className="min-w-0">
										<p className="font-medium leading-5 text-foreground">
											Falha no acesso
										</p>
										<p className="mt-0.5 leading-5">{loginErrorMessage}</p>
									</div>
								</div>
							) : null}

							<div className="space-y-2">
								<div className="space-y-1.5">
									<Label
										className="text-[0.82rem] font-medium text-muted-foreground"
										htmlFor="email"
									>
										E-mail
									</Label>
									<div className="relative">
										<Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
										<Input
											autoComplete="email"
											className={cn(
												'h-11 rounded-xl border-border bg-white pl-10 text-[0.9rem] text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50',
												form.formState.errors.email
													? 'border-destructive focus-visible:ring-destructive/20'
													: null,
											)}
											id="email"
											inputMode="email"
											placeholder="seu@email.com"
											type="email"
											{...form.register('email')}
										/>
									</div>
									{form.formState.errors.email ? (
										<p className="inline-flex items-center gap-2 text-sm text-destructive">
											<AlertCircle className="size-4" />
											{form.formState.errors.email.message}
										</p>
									) : null}
								</div>

								<div className="space-y-1.5">
									<Label
										className="text-[0.82rem] font-medium text-muted-foreground"
										htmlFor="password"
									>
										Senha
									</Label>
									<div className="relative">
										<Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
										<Input
											autoComplete="current-password"
											className={cn(
												'h-11 rounded-xl border-border bg-white pl-10 pr-10 text-[0.9rem] text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/50',
												form.formState.errors.password
													? 'border-destructive focus-visible:ring-destructive/20'
													: null,
											)}
											id="password"
											placeholder="Digite sua senha"
											type={passwordVisible ? 'text' : 'password'}
											{...form.register('password')}
										/>
										<button
											aria-label={
												passwordVisible ? 'Ocultar senha' : 'Mostrar senha'
											}
											className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground/80 hover:bg-muted/40 hover:text-foreground"
											onClick={() => setPasswordVisible((prev) => !prev)}
											type="button"
										>
											{passwordVisible ? (
												<EyeOff className="size-4" />
											) : (
												<Eye className="size-4" />
											)}
										</button>
									</div>
									{form.formState.errors.password ? (
										<p className="inline-flex items-center gap-2 text-sm text-destructive">
											<AlertCircle className="size-4" />
											{form.formState.errors.password.message}
										</p>
									) : null}
								</div>
							</div>

							<div className="flex items-center justify-between gap-4 pt-1 text-[0.82rem]">
								<label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
									<Checkbox className="rounded-xs" />
									Lembrar de mim
								</label>
								<AuthAccentLink
									className="font-medium"
									href={appRoutes.auth.forgotPassword}
								>
									Esqueci minha senha
								</AuthAccentLink>
							</div>

							<Button
								className="h-11 w-full rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/95"
								disabled={loginMutation.isPending}
								type="submit"
							>
								{loginMutation.isPending ? (
									<>
										<LoaderCircle className="size-4 animate-spin" />
										Entrando...
									</>
								) : (
									'Entrar'
								)}
							</Button>

							<p className="pt-1 text-center text-[0.82rem] text-muted-foreground">
								O acesso ao sistema é provisionado pelo administrador.
							</p>
						</form>
					</CardContent>

					<CardFooter className="border-t border-border/70">
						<div className="flex w-full items-start gap-3">
							<div className="grid size-9 place-items-center rounded-full bg-[color:var(--brand-accent-soft)]/55 text-[color:var(--brand-accent)] ring-1 ring-[color:var(--brand-accent)]/20">
								<ShieldCheck className="size-4" />
							</div>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-foreground">
									Segurança e confiança
								</p>
								<p className="mt-0.5 text-[0.82rem] leading-6 text-muted-foreground">
									Seus dados estão protegidos com os mais altos padrões de
									segurança.
								</p>
							</div>
						</div>
					</CardFooter>
				</Card>
			</div>
		</LoginScreenLayout>
	);
}

export { LoginForm };
