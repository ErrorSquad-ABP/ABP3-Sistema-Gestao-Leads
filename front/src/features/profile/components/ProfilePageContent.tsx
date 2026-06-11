'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { KeyRound, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppPageHeader } from '@/components/layout/AppPageHeader';
import { toast } from 'sonner';

import { ModalFormErrorBanner } from '@/components/feedback/ModalFormErrorBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label, requiredFieldProps } from '@/components/ui/label';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { getRoleLabel } from '@/features/users/components/UserForm';
import { queryKeys } from '@/lib/constants/query-keys';
import { appToastStyle } from '@/lib/feedback/app-toast-style';
import { humanizeFormApiError } from '@/lib/http/humanize-api-error';
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

type SettingsTab = 'email' | 'password';

const inputClass =
	'h-11 rounded-xl border-border bg-card shadow-none focus-visible:border-[color:var(--brand-accent)]/45';

function formatUserInitials(name: string) {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return 'US';
	}

	const [first = '', second = ''] = words;
	return `${first[0] ?? ''}${second[0] ?? first[1] ?? ''}`.toUpperCase();
}

function buildSuccessToast(
	context: SettingsTab,
	refreshSessionsRevoked: boolean,
	email?: string,
) {
	if (context === 'email') {
		return {
			title: 'E-mail atualizado',
			description: refreshSessionsRevoked
				? `Na próxima sessão, use ${email}.`
				: 'Seu e-mail de acesso foi atualizado.',
		};
	}

	return {
		title: 'Senha atualizada',
		description: 'Use a nova senha no próximo login.',
	};
}

type PasswordFormValues = UpdateOwnPasswordInput & {
	confirmPassword: string;
};

type ProfilePageContentProps = {
	currentUser: AuthenticatedUser;
};

function SettingsTabButton({
	active,
	icon: Icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: typeof Mail;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			className={cn(
				'inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
				active
					? 'border-[color:var(--brand-accent)] text-[color:var(--brand-accent)]'
					: 'border-transparent text-muted-foreground hover:text-foreground',
			)}
			onClick={onClick}
			type="button"
		>
			<Icon className="size-4" />
			{label}
		</button>
	);
}

function FormSectionHeader({
	description,
	icon: Icon,
	title,
}: {
	description: string;
	icon: typeof Mail;
	title: string;
}) {
	return (
		<div className="flex items-start gap-4">
			<div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)] text-[color:var(--brand-accent)]">
				<Icon className="size-6" />
			</div>
			<div>
				<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				<p className="mt-1 text-sm leading-6 text-muted-foreground">
					{description}
				</p>
			</div>
		</div>
	);
}

function ProfilePageContent({
	currentUser: initialCurrentUser,
}: ProfilePageContentProps) {
	const queryClient = useQueryClient();
	const [currentUser, setCurrentUser] = useState(initialCurrentUser);
	const [activeTab, setActiveTab] = useState<SettingsTab>('email');
	const updateOwnEmailMutation = useUpdateOwnEmailMutation();
	const updateOwnPasswordMutation = useUpdateOwnPasswordMutation();

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
		if (globalThis.location.hash === '#credentials') {
			setActiveTab('password');
		}
	}, []);

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
		updateOwnEmailMutation.reset();
		try {
			const result = await updateOwnEmailMutation.mutateAsync(values);
			syncCurrentUserCache(result);
			const feedback = buildSuccessToast(
				'email',
				result.refreshSessionsRevoked,
				result.email,
			);
			toast.success(feedback.title, {
				description: feedback.description,
				...appToastStyle,
			});
			emailForm.reset({
				currentPassword: '',
				email: result.email,
			});
		} catch {
			// mutation error rendered below
		}
	});

	const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
		updateOwnPasswordMutation.reset();
		try {
			const result = await updateOwnPasswordMutation.mutateAsync({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});
			syncCurrentUserCache(result);
			const feedback = buildSuccessToast(
				'password',
				result.refreshSessionsRevoked,
			);
			toast.success(feedback.title, {
				description: feedback.description,
				...appToastStyle,
			});
			passwordForm.reset({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
			});
		} catch {
			// mutation error rendered below
		}
	});

	const emailErrorMessage = updateOwnEmailMutation.error
		? humanizeFormApiError(updateOwnEmailMutation.error)
		: null;
	const passwordErrorMessage = updateOwnPasswordMutation.error
		? humanizeFormApiError(updateOwnPasswordMutation.error)
		: null;

	return (
		<div className="space-y-6">
			<AppPageHeader
				description="Gerencie o e-mail e a senha usados para entrar no sistema."
				title="Minha conta"
			/>

			<div className="grid gap-5 xl:grid-cols-[minmax(0,18rem)_1fr]">
				<Card className="h-fit overflow-hidden rounded-3xl border-border bg-card shadow-sm">
					<CardContent className="space-y-5 p-6">
						<div className="flex flex-col items-center gap-3 text-center">
							<div className="flex size-20 items-center justify-center rounded-full bg-[color:var(--brand-accent-soft)] text-2xl font-semibold text-[color:var(--brand-accent)]">
								{formatUserInitials(currentUser.name)}
							</div>
							<div className="space-y-2">
								<p className="text-lg font-semibold text-foreground">
									{currentUser.name}
								</p>
								<span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--brand-accent)]/20 bg-[color:var(--brand-accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--brand-accent)]">
									<ShieldCheck className="size-3.5" />
									{getRoleLabel(currentUser.role)}
								</span>
							</div>
						</div>

						<div className="space-y-4 border-t border-border pt-5">
							<div className="flex items-start gap-3">
								<Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
								<div className="min-w-0">
									<p className="text-xs font-medium text-muted-foreground">
										E-mail de acesso
									</p>
									<p className="mt-1 text-sm font-medium break-all text-foreground">
										{currentUser.email}
									</p>
								</div>
							</div>

							<div className="rounded-2xl bg-[color:var(--brand-accent-soft)] p-4">
								<div className="flex items-start gap-3">
									<ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--brand-accent)]" />
									<div>
										<p className="text-sm font-semibold text-[color:var(--brand-accent)]">
											Segurança
										</p>
										<p className="mt-1 text-sm leading-6 text-[color:var(--brand-accent-hover)]">
											Alterações exigem a senha atual para confirmação.
										</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="overflow-hidden rounded-3xl border-border bg-card shadow-sm">
					<CardContent className="p-0">
						<div className="flex gap-6 border-b border-border px-6 pt-5">
							<SettingsTabButton
								active={activeTab === 'email'}
								icon={Mail}
								label="E-mail"
								onClick={() => setActiveTab('email')}
							/>
							<SettingsTabButton
								active={activeTab === 'password'}
								icon={KeyRound}
								label="Senha"
								onClick={() => setActiveTab('password')}
							/>
						</div>

						<div className="p-6">
							{activeTab === 'email' ? (
								<div className="mx-auto max-w-xl space-y-6">
									<FormSectionHeader
										description="Informe o novo endereço e confirme com sua senha atual."
										icon={Mail}
										title="Atualizar e-mail"
									/>

									<ModalFormErrorBanner message={emailErrorMessage} />

									<form
										className="space-y-4"
										noValidate
										onSubmit={handleEmailSubmit}
									>
										<div className="space-y-1.5">
											<Label htmlFor="profile-email" required>
												Novo e-mail
											</Label>
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
												{...requiredFieldProps()}
											/>
											{emailForm.formState.errors.email ? (
												<p className="text-xs text-destructive">
													{emailForm.formState.errors.email.message}
												</p>
											) : null}
										</div>

										<div className="space-y-1.5">
											<Label htmlFor="profile-email-current-password" required>
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
												{...requiredFieldProps()}
											/>
											{emailForm.formState.errors.currentPassword ? (
												<p className="text-xs text-destructive">
													{emailForm.formState.errors.currentPassword.message}
												</p>
											) : null}
										</div>

										<Button
											className="h-11 w-full rounded-xl bg-[color:var(--brand-accent)] text-white shadow-none hover:bg-[color:var(--brand-accent-hover)]"
											disabled={updateOwnEmailMutation.isPending}
											type="submit"
										>
											{updateOwnEmailMutation.isPending ? (
												<span className="inline-flex items-center gap-2">
													<LoaderCircle className="size-4 animate-spin" />
													Salvando...
												</span>
											) : (
												'Salvar alterações'
											)}
										</Button>
									</form>
								</div>
							) : (
								<div className="mx-auto max-w-xl space-y-6">
									<FormSectionHeader
										description="Escolha uma nova senha e confirme com a senha atual."
										icon={KeyRound}
										title="Atualizar senha"
									/>

									<ModalFormErrorBanner message={passwordErrorMessage} />

									<form
										className="space-y-4"
										noValidate
										onSubmit={handlePasswordSubmit}
									>
										<div className="space-y-1.5">
											<Label htmlFor="profile-current-password" required>
												Senha atual
											</Label>
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
												{...requiredFieldProps()}
											/>
											{passwordForm.formState.errors.currentPassword ? (
												<p className="text-xs text-destructive">
													{
														passwordForm.formState.errors.currentPassword
															.message
													}
												</p>
											) : null}
										</div>

										<div className="space-y-1.5">
											<Label htmlFor="profile-new-password" required>
												Nova senha
											</Label>
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
												{...requiredFieldProps()}
											/>
											{passwordForm.formState.errors.newPassword ? (
												<p className="text-xs text-destructive">
													{passwordForm.formState.errors.newPassword.message}
												</p>
											) : null}
										</div>

										<div className="space-y-1.5">
											<Label htmlFor="profile-confirm-password" required>
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
												{...requiredFieldProps()}
											/>
											{passwordForm.formState.errors.confirmPassword ? (
												<p className="text-xs text-destructive">
													{
														passwordForm.formState.errors.confirmPassword
															.message
													}
												</p>
											) : null}
										</div>

										<Button
											className="h-11 w-full rounded-xl bg-[color:var(--brand-accent)] text-white shadow-none hover:bg-[color:var(--brand-accent-hover)]"
											disabled={updateOwnPasswordMutation.isPending}
											type="submit"
										>
											{updateOwnPasswordMutation.isPending ? (
												<span className="inline-flex items-center gap-2">
													<LoaderCircle className="size-4 animate-spin" />
													Salvando...
												</span>
											) : (
												'Salvar alterações'
											)}
										</Button>
									</form>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

export { ProfilePageContent };
