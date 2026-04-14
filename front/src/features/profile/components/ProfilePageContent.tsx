'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
	AlertCircle,
	CheckCircle2,
	KeyRound,
	LoaderCircle,
	Mail,
	ShieldCheck,
	UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
	AuthenticatedUser,
	UserRole,
} from '@/features/login/types/login.types';
import { queryKeys } from '@/lib/constants/query-keys';
import { isApiError } from '@/lib/http/api-error';
import { cn } from '@/lib/utils';

import {
	updateOwnEmailSchema,
	updateOwnPasswordSchema,
} from '../schemas/profile.schema';
import type {
	UpdateOwnEmailInput,
	UpdateOwnPasswordInput,
} from '../types/profile.types';
import {
	useUpdateOwnEmailMutation,
	useUpdateOwnPasswordMutation,
} from '../hooks/profile.mutations';

function resolveRoleLabel(role: UserRole) {
	switch (role) {
		case 'ATTENDANT':
			return 'Atendente';
		case 'MANAGER':
			return 'Gerente';
		case 'GENERAL_MANAGER':
			return 'Gerente geral';
		case 'ADMINISTRATOR':
			return 'Administrador';
	}
}

function resolveCredentialErrorMessage(
	error: unknown,
	context: 'email' | 'password',
) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a atualização agora. Tente novamente em instantes.';
	}

	if (error.status === 401) {
		return 'A senha atual informada não confere ou sua sessão já não é mais válida.';
	}

	if (error.status === 409 && context === 'email') {
		return 'O e-mail informado já está em uso por outro utilizador.';
	}

	if (error.status === 429) {
		return 'Muitas tentativas de alteração em sequência. Aguarde um momento antes de tentar novamente.';
	}

	if (error.status === 400 && error.code === 'user.password.unchanged') {
		return 'A nova senha deve ser diferente da senha atual.';
	}

	return error.message;
}

type SuccessFeedback = {
	title: string;
	description: string;
};

type PasswordFormValues = UpdateOwnPasswordInput & {
	confirmPassword: string;
};

function buildSuccessFeedback(
	context: 'email' | 'password',
	refreshSessionsRevoked: boolean,
	email?: string,
): SuccessFeedback {
	if (context === 'email') {
		return {
			title: 'E-mail atualizado com sucesso',
			description: refreshSessionsRevoked
				? `Seu acesso principal passa a usar ${email}. As sessões de refresh foram revogadas e um novo login será necessário quando a sessão atual expirar.`
				: 'O e-mail foi mantido conforme o valor já cadastrado e sua sessão continua ativa normalmente.',
		};
	}

	return {
		title: 'Senha atualizada com sucesso',
		description:
			'As sessões de refresh foram revogadas pelo backend. Você permanece com a sessão atual até o access token expirar; depois disso, será necessário entrar novamente.',
	};
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return (
		<p className="inline-flex items-center gap-2 text-sm text-destructive">
			<AlertCircle className="size-4" />
			{message}
		</p>
	);
}

type ProfilePageContentProps = {
	currentUser: AuthenticatedUser;
};

function ProfilePageContent({
	currentUser: initialCurrentUser,
}: ProfilePageContentProps) {
	const queryClient = useQueryClient();
	const [currentUser, setCurrentUser] = useState(initialCurrentUser);
	const updateOwnEmailMutation = useUpdateOwnEmailMutation();
	const updateOwnPasswordMutation = useUpdateOwnPasswordMutation();
	const [emailSuccess, setEmailSuccess] = useState<SuccessFeedback | null>(
		null,
	);
	const [passwordSuccess, setPasswordSuccess] =
		useState<SuccessFeedback | null>(null);

	const emailForm = useForm<UpdateOwnEmailInput>({
		resolver: zodResolver(updateOwnEmailSchema),
		defaultValues: {
			currentPassword: '',
			email: '',
		},
	});

	const passwordForm = useForm<PasswordFormValues>({
		resolver: zodResolver(updateOwnPasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	useEffect(() => {
		emailForm.reset({
			currentPassword: '',
			email: currentUser.email,
		});
	}, [currentUser, emailForm]);

	useEffect(() => {
		queryClient.setQueryData(queryKeys.auth.currentUser, currentUser);
	}, [currentUser, queryClient]);

	const syncCurrentUserCache = (user: AuthenticatedUser) => {
		setCurrentUser(user);
		queryClient.setQueryData(queryKeys.auth.currentUser, user);
	};

	const handleEmailSubmit = emailForm.handleSubmit(async (values) => {
		setEmailSuccess(null);
		const result = await updateOwnEmailMutation.mutateAsync(values);
		syncCurrentUserCache(result);
		setEmailSuccess(
			buildSuccessFeedback(
				'email',
				result.refreshSessionsRevoked,
				result.email,
			),
		);
		emailForm.reset({
			currentPassword: '',
			email: result.email,
		});
	});

	const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
		setPasswordSuccess(null);
		const result = await updateOwnPasswordMutation.mutateAsync({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
		});
		syncCurrentUserCache(result);
		setPasswordSuccess(
			buildSuccessFeedback('password', result.refreshSessionsRevoked),
		);
		passwordForm.reset({
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		});
	});

	const emailErrorMessage = updateOwnEmailMutation.error
		? resolveCredentialErrorMessage(updateOwnEmailMutation.error, 'email')
		: null;
	const passwordErrorMessage = updateOwnPasswordMutation.error
		? resolveCredentialErrorMessage(updateOwnPasswordMutation.error, 'password')
		: null;

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(241,226,218,0.9),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#f4f6f8_58%,_#eef2f5_100%)] px-4 py-8 sm:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				<section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<Card className="overflow-hidden border-white/70 bg-white/92 backdrop-blur">
						<CardHeader className="gap-4 border-b border-[#e7ecf2] bg-[linear-gradient(135deg,_rgba(45,54,72,0.05),_rgba(217,108,63,0.08))]">
							<div className="flex items-center gap-3">
								<div className="flex size-11 items-center justify-center rounded-2xl bg-[#2d3648] text-white shadow-sm">
									<ShieldCheck className="size-5" />
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
										Perfil de acesso
									</p>
									<CardTitle className="text-[1.7rem]">
										Atualize seu próprio acesso com segurança
									</CardTitle>
								</div>
							</div>
							<p className="max-w-2xl text-sm leading-6 text-muted-foreground">
								Esta área centraliza a atualização do seu e-mail de login e da
								sua senha atual, seguindo o fluxo protegido previsto para a
								`US-02`.
							</p>
						</CardHeader>
						<CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
							{currentUser
								? [
										{
											label: 'Nome',
											value: currentUser.name,
											icon: <UserRound className="size-4 text-[#2d3648]" />,
										},
										{
											label: 'Papel',
											value: resolveRoleLabel(currentUser.role),
											icon: <ShieldCheck className="size-4 text-[#2d3648]" />,
										},
										{
											label: 'E-mail atual',
											value: currentUser.email,
											icon: <Mail className="size-4 text-[#2d3648]" />,
										},
									].map((item) => (
										<div
											className="rounded-2xl border border-[#e3e8ef] bg-[#fbfcfd] p-4"
											key={item.label}
										>
											<div className="mb-3 inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#7b8797]">
												{item.icon}
												{item.label}
											</div>
											<p className="break-words text-sm font-medium text-[#1b2430]">
												{item.value}
											</p>
										</div>
									))
								: null}
						</CardContent>
					</Card>

					<Card className="border-[#e3e8ef] bg-[#2d3648] text-white">
						<CardHeader>
							<CardTitle className="text-[1.2rem] text-white">
								Como o backend trata sua sessão
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 text-sm leading-6 text-slate-200">
							<div className="rounded-2xl border border-white/10 bg-white/6 p-4">
								<p className="font-medium text-white">Atualização de e-mail</p>
								<p className="mt-2">
									Quando o e-mail muda de fato, o backend revoga todas as
									sessões de refresh. Se o valor permanecer igual ao atual, sua
									sessão é preservada.
								</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/6 p-4">
								<p className="font-medium text-white">Atualização de senha</p>
								<p className="mt-2">
									A troca de senha sempre invalida as sessões de refresh e exige
									novo login quando o access token atual expirar.
								</p>
							</div>
						</CardContent>
					</Card>
				</section>

				<section className="grid gap-6 xl:grid-cols-2">
					<Card className="border-[#e3e8ef] bg-white/94" id="profile">
						<CardHeader className="gap-2">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-2xl bg-[#f1e2da] text-[#d96c3f]">
									<Mail className="size-5" />
								</div>
								<div>
									<CardTitle className="text-[1.2rem]">
										Atualizar e-mail de acesso
									</CardTitle>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										Confirme sua senha atual para alterar o endereço usado no
										login.
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{emailSuccess ? (
								<Alert variant="success">
									<AlertTitle className="flex items-center gap-2">
										<CheckCircle2 className="size-4" />
										{emailSuccess.title}
									</AlertTitle>
									<AlertDescription>
										{emailSuccess.description}
									</AlertDescription>
								</Alert>
							) : null}

							{emailErrorMessage ? (
								<Alert
									className="border-[#f1c7c4] bg-[#fff7f7]"
									variant="destructive"
								>
									<AlertTitle className="flex items-center gap-2 text-[#7a2f2a]">
										<AlertCircle className="size-4" />
										Falha ao atualizar e-mail
									</AlertTitle>
									<AlertDescription className="text-[#7a2f2a]">
										{emailErrorMessage}
									</AlertDescription>
								</Alert>
							) : null}

							<form
								className="space-y-4"
								noValidate
								onSubmit={handleEmailSubmit}
							>
								<div className="space-y-1.5">
									<Label htmlFor="profile-email">Novo e-mail</Label>
									<Input
										autoComplete="email"
										className={cn(
											emailForm.formState.errors.email
												? 'border-destructive focus-visible:border-destructive'
												: null,
										)}
										id="profile-email"
										inputMode="email"
										placeholder="exemplo@leadcrm.com"
										type="email"
										{...emailForm.register('email')}
									/>
									<FieldError
										message={emailForm.formState.errors.email?.message}
									/>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="profile-email-current-password">
										Senha atual
									</Label>
									<Input
										autoComplete="current-password"
										className={cn(
											emailForm.formState.errors.currentPassword
												? 'border-destructive focus-visible:border-destructive'
												: null,
										)}
										id="profile-email-current-password"
										placeholder="Digite sua senha atual"
										type="password"
										{...emailForm.register('currentPassword')}
									/>
									<FieldError
										message={
											emailForm.formState.errors.currentPassword?.message
										}
									/>
								</div>

								<Button
									className="w-full rounded-xl bg-[#2d3648] text-white hover:bg-[#232b3b]"
									disabled={updateOwnEmailMutation.isPending}
									type="submit"
								>
									{updateOwnEmailMutation.isPending ? (
										<>
											<LoaderCircle className="size-4 animate-spin" />
											Salvando e-mail...
										</>
									) : (
										'Salvar novo e-mail'
									)}
								</Button>
							</form>
						</CardContent>
					</Card>

					<Card className="border-[#e3e8ef] bg-white/94" id="credentials">
						<CardHeader className="gap-2">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-2xl bg-[#edf2f8] text-[#2d3648]">
									<KeyRound className="size-5" />
								</div>
								<div>
									<CardTitle className="text-[1.2rem]">
										Atualizar senha
									</CardTitle>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										Escolha uma nova senha e confirme a alteração com a senha
										atual.
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{passwordSuccess ? (
								<Alert variant="success">
									<AlertTitle className="flex items-center gap-2">
										<CheckCircle2 className="size-4" />
										{passwordSuccess.title}
									</AlertTitle>
									<AlertDescription>
										{passwordSuccess.description}
									</AlertDescription>
								</Alert>
							) : null}

							{passwordErrorMessage ? (
								<Alert
									className="border-[#f1c7c4] bg-[#fff7f7]"
									variant="destructive"
								>
									<AlertTitle className="flex items-center gap-2 text-[#7a2f2a]">
										<AlertCircle className="size-4" />
										Falha ao atualizar senha
									</AlertTitle>
									<AlertDescription className="text-[#7a2f2a]">
										{passwordErrorMessage}
									</AlertDescription>
								</Alert>
							) : null}

							<form
								className="space-y-4"
								noValidate
								onSubmit={handlePasswordSubmit}
							>
								<div className="space-y-1.5">
									<Label htmlFor="profile-current-password">Senha atual</Label>
									<Input
										autoComplete="current-password"
										className={cn(
											passwordForm.formState.errors.currentPassword
												? 'border-destructive focus-visible:border-destructive'
												: null,
										)}
										id="profile-current-password"
										placeholder="Digite sua senha atual"
										type="password"
										{...passwordForm.register('currentPassword')}
									/>
									<FieldError
										message={
											passwordForm.formState.errors.currentPassword?.message
										}
									/>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="profile-new-password">Nova senha</Label>
									<Input
										autoComplete="new-password"
										className={cn(
											passwordForm.formState.errors.newPassword
												? 'border-destructive focus-visible:border-destructive'
												: null,
										)}
										id="profile-new-password"
										placeholder="Mínimo de 8 caracteres"
										type="password"
										{...passwordForm.register('newPassword')}
									/>
									<FieldError
										message={passwordForm.formState.errors.newPassword?.message}
									/>
								</div>

								<div className="space-y-1.5">
									<Label htmlFor="profile-confirm-password">
										Confirmar nova senha
									</Label>
									<Input
										autoComplete="new-password"
										className={cn(
											passwordForm.formState.errors.confirmPassword
												? 'border-destructive focus-visible:border-destructive'
												: null,
										)}
										id="profile-confirm-password"
										placeholder="Repita a nova senha"
										type="password"
										{...passwordForm.register('confirmPassword')}
									/>
									<FieldError
										message={
											passwordForm.formState.errors.confirmPassword?.message
										}
									/>
								</div>

								<Button
									className="w-full rounded-xl bg-[#2d3648] text-white hover:bg-[#232b3b]"
									disabled={updateOwnPasswordMutation.isPending}
									type="submit"
								>
									{updateOwnPasswordMutation.isPending ? (
										<>
											<LoaderCircle className="size-4 animate-spin" />
											Salvando senha...
										</>
									) : (
										'Salvar nova senha'
									)}
								</Button>
							</form>
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	);
}

export { ProfilePageContent };
