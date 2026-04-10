'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, LoaderCircle, WifiOff } from 'lucide-react';
import { startTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryKeys } from '@/lib/constants/query-keys';
import { isApiError } from '@/lib/http/api-error';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

import { useLoginMutation } from '../hooks/login.mutations';
import { useCurrentUserQuery } from '../hooks/login.queries';
import { loginSchema } from '../schemas/login.schema';
import type { LoginInput } from '../types/login.types';
import { AuthAccentLink } from './AuthAccentLink';
import { AuthScreenLayout } from './AuthScreenLayout';
import { AuthStatusIndicator } from './AuthStatusIndicator';

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
		const result = await loginMutation.mutateAsync(values);
		queryClient.setQueryData(queryKeys.auth.currentUser, result.user);
		startTransition(() => {
			router.replace(appRoutes.app.root);
		});
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
		<AuthScreenLayout
			asideTitle="Acompanhe leads, negociações e desempenho em um só lugar."
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
			subtitle="Entre na sua conta agora"
			title="Bem-vindo ao Lead CRM"
		>
			<div className="w-full space-y-4">
				<form className="space-y-4" noValidate onSubmit={handleSubmit}>
					<div className="space-y-4">
						{loginErrorMessage ? (
							<div className="flex items-start gap-2.5 rounded-md border border-[#f1c7c4] bg-[#fff7f7] px-3 py-2.5 text-[0.82rem] text-[#7a2f2a]">
								<AlertCircle
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0 text-[#c65a52]"
								/>
								<div className="min-w-0">
									<p className="font-medium leading-5">Falha no acesso</p>
									<p className="mt-0.5 leading-5">{loginErrorMessage}</p>
								</div>
							</div>
						) : null}

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

						<div className="space-y-1.5">
							<Label
								className="text-[0.82rem] font-normal text-[#6b7687]"
								htmlFor="password"
							>
								Senha*
							</Label>
							<Input
								autoComplete="current-password"
								className={cn(
									'h-10 rounded-md border-[#d6dce5] bg-white px-3 text-[0.85rem] text-[#1b2430] shadow-none placeholder:text-[#97a2b1] focus-visible:border-[#2d3648]/45',
									form.formState.errors.password
										? 'border-destructive focus-visible:border-destructive'
										: null,
								)}
								id="password"
								placeholder="Digite sua senha"
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

						<div className="flex flex-wrap items-center justify-end gap-4 text-[0.82rem]">
							<AuthAccentLink
								className="font-medium"
								href={appRoutes.auth.forgotPassword}
							>
								Recuperar acesso
							</AuthAccentLink>
						</div>
					</div>

					<Button
						className="h-9 w-full rounded-md bg-[#2D3648] text-[0.85rem] font-medium text-white shadow-none hover:bg-[#232B3B]"
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

					<p className="text-center text-[0.82rem] text-[#6b7687]">
						O acesso ao sistema é provisionado pelo administrador.
					</p>
				</form>
			</div>
		</AuthScreenLayout>
	);
}

export { LoginForm };
