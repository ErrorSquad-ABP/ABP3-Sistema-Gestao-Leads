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

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
	useUpdateOwnEmailMutation,
	useUpdateOwnPasswordMutation,
} from '../hooks/profile.mutations';
import {
	updateOwnEmailSchema,
	updateOwnPasswordSchema,
} from '../schemas/profile.schema';
import type {
	UpdateOwnEmailInput,
	UpdateOwnPasswordInput,
} from '../types/profile.types';

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
			title: 'E-mail atualizado',
			description: refreshSessionsRevoked
				? `Alterações guardadas. Da próxima vez que iniciar sessão nesta aplicação, utilize o endereço ${email}.`
				: 'Alterações guardadas. O e-mail que utiliza para entrar mantém-se o mesmo.',
		};
	}

	return {
		title: 'Palavra-passe atualizada',
		description:
			'Alterações guardadas. Na próxima vez que iniciar sessão, utilize a nova palavra-passe.',
	};
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return (
		<p className="inline-flex items-center gap-2 text-sm text-destructive">
			<AlertCircle className="size-4 shrink-0" />
			{message}
		</p>
	);
}

const inputClass =
	'h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] shadow-none focus-visible:border-[#2d3648]/45';

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

	const summaryItems = currentUser
		? [
				{
					label: 'Nome',
					value: currentUser.name,
					icon: UserRound,
				},
				{
					label: 'Papel',
					value: resolveRoleLabel(currentUser.role),
					icon: ShieldCheck,
				},
				{
					label: 'E-mail atual',
					value: currentUser.email,
					icon: Mail,
				},
			]
		: [];

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden rounded-[1.75rem] border-border/90 bg-white">
				<CardHeader className="gap-5 border-none pb-4 sm:pb-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0 flex-1 space-y-3">
							<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<ShieldCheck className="size-5" />
							</div>
							<div className="space-y-2">
								<p className="text-sm font-medium uppercase tracking-[0.18em] text-[#d96c3f]">
									Conta e segurança
								</p>
								<CardTitle className="text-[1.65rem] font-semibold tracking-tight sm:text-[1.9rem]">
									Perfil e credenciais
								</CardTitle>
								<p className="max-w-2xl text-[0.95rem] leading-7 text-muted-foreground">
									Atualize aqui as credenciais da sua conta no Sistema de Gestão
									de Leads: o e-mail com que entra na aplicação e a
									palavra-passe. Em ambos os casos pedimos a palavra-passe atual
									antes de guardar, para confirmar que é mesmo você.
								</p>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="border-t border-border/70 pt-6">
					<ul className="grid gap-4 sm:grid-cols-3">
						{summaryItems.map(({ label, value, icon: Icon }) => (
							<li
								className="flex min-h-22 flex-col rounded-xl border border-border/80 bg-[#f8fafc]/80 px-4 py-3"
								key={label}
							>
								<div className="mb-2 flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
									<Icon
										aria-hidden
										className="size-4 shrink-0 text-[#2d3648]/80"
									/>
									{label}
								</div>
								<p
									className="min-w-0 flex-1 wrap-break-word text-sm font-medium leading-snug text-[#1b2430]"
									title={value}
								>
									{value}
								</p>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2 lg:items-start">
				<Card
					className="h-full overflow-hidden rounded-[1.75rem] border-border/90 bg-white"
					id="profile"
				>
					<CardHeader className="gap-4 border-none pb-2">
						<div className="flex items-start gap-3">
							<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<Mail className="size-5" />
							</div>
							<div className="min-w-0 space-y-1">
								<p className="text-xs font-medium uppercase tracking-[0.14em] text-[#d96c3f]">
									E-mail
								</p>
								<CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
									Atualizar e-mail de acesso
								</CardTitle>
								<p className="text-sm leading-6 text-muted-foreground">
									Indique o novo e-mail e a palavra-passe atual para validar a
									alteração.
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 pt-2">
						{emailSuccess ? (
							<Alert variant="success">
								<AlertTitle className="flex items-center gap-2">
									<CheckCircle2 className="size-4 shrink-0" />
									{emailSuccess.title}
								</AlertTitle>
								<AlertDescription>{emailSuccess.description}</AlertDescription>
							</Alert>
						) : null}

						{emailErrorMessage ? (
							<Alert
								className="border-[#f1c7c4] bg-[#fff7f7]"
								variant="destructive"
							>
								<AlertTitle className="flex items-center gap-2 text-[#7a2f2a]">
									<AlertCircle className="size-4 shrink-0" />
									Falha ao atualizar e-mail
								</AlertTitle>
								<AlertDescription className="text-[#7a2f2a]">
									{emailErrorMessage}
								</AlertDescription>
							</Alert>
						) : null}

						<form className="space-y-4" noValidate onSubmit={handleEmailSubmit}>
							<div className="space-y-1.5">
								<Label htmlFor="profile-email">Novo e-mail</Label>
								<Input
									autoComplete="email"
									className={cn(
										inputClass,
										emailForm.formState.errors.email
											? 'border-destructive focus-visible:border-destructive'
											: null,
									)}
									id="profile-email"
									inputMode="email"
									placeholder="exemplo@empresa.com"
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
										inputClass,
										emailForm.formState.errors.currentPassword
											? 'border-destructive focus-visible:border-destructive'
											: null,
									)}
									id="profile-email-current-password"
									placeholder="Senha atual"
									type="password"
									{...emailForm.register('currentPassword')}
								/>
								<FieldError
									message={emailForm.formState.errors.currentPassword?.message}
								/>
							</div>

							<Button
								className="h-10 w-full rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
								disabled={updateOwnEmailMutation.isPending}
								type="submit"
							>
								{updateOwnEmailMutation.isPending ? (
									<span className="inline-flex items-center justify-center gap-2">
										<LoaderCircle className="size-4 animate-spin" />A guardar…
									</span>
								) : (
									'Guardar e-mail'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>

				<Card
					className="h-full overflow-hidden rounded-[1.75rem] border-border/90 bg-white"
					id="credentials"
				>
					<CardHeader className="gap-4 border-none pb-2">
						<div className="flex items-start gap-3">
							<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#2d3648]/12 bg-[#edf2f8] text-[#2d3648]">
								<KeyRound className="size-5" />
							</div>
							<div className="min-w-0 space-y-1">
								<p className="text-xs font-medium uppercase tracking-[0.14em] text-[#6b7687]">
									Senha
								</p>
								<CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
									Atualizar senha
								</CardTitle>
								<p className="text-sm leading-6 text-muted-foreground">
									Escolha a nova palavra-passe, confirme-a e indique a atual
									para validar.
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4 pt-2">
						{passwordSuccess ? (
							<Alert variant="success">
								<AlertTitle className="flex items-center gap-2">
									<CheckCircle2 className="size-4 shrink-0" />
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
									<AlertCircle className="size-4 shrink-0" />
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
										inputClass,
										passwordForm.formState.errors.currentPassword
											? 'border-destructive focus-visible:border-destructive'
											: null,
									)}
									id="profile-current-password"
									placeholder="Senha atual"
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
										inputClass,
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
										inputClass,
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
								className="h-10 w-full rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
								disabled={updateOwnPasswordMutation.isPending}
								type="submit"
							>
								{updateOwnPasswordMutation.isPending ? (
									<span className="inline-flex items-center justify-center gap-2">
										<LoaderCircle className="size-4 animate-spin" />A guardar…
									</span>
								) : (
									'Guardar nova senha'
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export { ProfilePageContent };
