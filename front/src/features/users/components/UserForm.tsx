'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogDescription,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isApiError } from '@/lib/http/api-error';

import {
	createUserSchema,
	updateUserSchema,
	type CreateUserFormValues,
	type UpdateUserFormValues,
} from '../schemas/user-management.schema';
import {
	roleLabels,
	roleOptions,
	type AccessGroup,
	type UserRecord,
} from '../types/users.types';

type UsersFormDialogProps = {
	accessGroups: AccessGroup[];
	isPending: boolean;
	mode: 'create' | 'edit';
	onClose: () => void;
	onSubmit: (
		values: CreateUserFormValues | UpdateUserFormValues,
	) => Promise<void>;
	open: boolean;
	user: UserRecord | null;
};

type DeleteDialogProps = {
	title: string;
	description: string;
	error: string | null;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	open: boolean;
};

function getUsersErrorMessage(error: unknown) {
	if (!isApiError(error)) {
		return 'Não foi possível concluir a operação agora. Tente novamente em instantes.';
	}

	if (error.status === 409) {
		return 'Já existe um registro com os dados informados.';
	}

	if (error.status === 400) {
		return (
			error.message || 'Os dados informados não passaram na validação da API.'
		);
	}

	return error.message;
}

function getRoleBadgeClassName(role: UserRecord['role']) {
	switch (role) {
		case 'ADMINISTRATOR':
			return 'border-[#d96c3f]/25 bg-[#d96c3f]/10 text-[#b3542c]';
		case 'GENERAL_MANAGER':
			return 'border-[#2d3648]/15 bg-[#2d3648]/8 text-[#2d3648]';
		case 'MANAGER':
			return 'border-sky-200 bg-sky-50 text-sky-800';
		case 'ATTENDANT':
			return 'border-emerald-200 bg-emerald-50 text-emerald-800';
	}
}

function getRoleCardCopy(role: UserRecord['role']) {
	switch (role) {
		case 'ADMINISTRATOR':
			return 'Acesso completo à administração do sistema';
		case 'GENERAL_MANAGER':
			return 'Visão analítica consolidada e gestão executiva';
		case 'MANAGER':
			return 'Acompanhamento operacional e supervisão de equipe';
		case 'ATTENDANT':
			return 'Execução comercial e gestão de leads';
	}
}

function formatTeamLabel(teamId: string | null) {
	if (!teamId) {
		return 'Sem equipe';
	}

	return `Equipe ${teamId.slice(0, 8)}`;
}

function getRoleLabel(role: UserRecord['role']) {
	switch (role) {
		case 'ADMINISTRATOR':
			return roleLabels.ADMINISTRATOR;
		case 'ATTENDANT':
			return roleLabels.ATTENDANT;
		case 'GENERAL_MANAGER':
			return roleLabels.GENERAL_MANAGER;
		case 'MANAGER':
			return roleLabels.MANAGER;
	}
}

function getDefaultAccessGroupId(
	accessGroups: AccessGroup[],
	role: UserRecord['role'],
) {
	return (
		accessGroups.find((group) => group.baseRole === role)?.id ??
		accessGroups.find((group) => group.baseRole === null)?.id ??
		null
	);
}

function UsersFormDialog({
	accessGroups,
	isPending,
	mode,
	onClose,
	onSubmit,
	open,
	user,
}: UsersFormDialogProps) {
	const isEditMode = mode === 'edit';
	const [submitError, setSubmitError] = useState<string | null>(null);
	const createForm = useForm<CreateUserFormValues>({
		resolver: zodResolver(createUserSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			role: 'ATTENDANT',
			accessGroupId: getDefaultAccessGroupId(accessGroups, 'ATTENDANT'),
		},
	});
	const updateForm = useForm<UpdateUserFormValues>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			role: 'ATTENDANT',
			accessGroupId: getDefaultAccessGroupId(accessGroups, 'ATTENDANT'),
		},
	});
	const form = isEditMode ? updateForm : createForm;
	const selectedRole = form.watch('role');
	const availableAccessGroups = useMemo(
		() =>
			accessGroups.filter(
				(group) => group.baseRole === null || group.baseRole === selectedRole,
			),
		[accessGroups, selectedRole],
	);

	useEffect(() => {
		if (!open) {
			form.reset();
			setSubmitError(null);
			return;
		}

		if (isEditMode && user) {
			updateForm.reset({
				name: user.name,
				email: user.email,
				password: '',
				role: user.role,
				accessGroupId:
					user.accessGroupId ??
					getDefaultAccessGroupId(accessGroups, user.role),
			});
			return;
		}

		createForm.reset({
			name: '',
			email: '',
			password: '',
			role: 'ATTENDANT',
			accessGroupId: getDefaultAccessGroupId(accessGroups, 'ATTENDANT'),
		});
	}, [accessGroups, createForm, form, isEditMode, open, updateForm, user]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const currentAccessGroupId = form.getValues('accessGroupId');
		const currentStillValid = availableAccessGroups.some(
			(group) => group.id === currentAccessGroupId,
		);

		if (!currentStillValid) {
			form.setValue(
				'accessGroupId',
				getDefaultAccessGroupId(accessGroups, selectedRole),
				{ shouldDirty: true, shouldValidate: true },
			);
		}
	}, [accessGroups, availableAccessGroups, form, open, selectedRole]);

	const handleSubmit = form.handleSubmit(async (values) => {
		setSubmitError(null);

		try {
			await onSubmit(values);
			onClose();
		} catch (error) {
			setSubmitError(getUsersErrorMessage(error));
		}
	});

	return (
		<Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? 'Editar usuário' : 'Novo usuário'}
					</DialogTitle>
					<DialogDescription>
						{isEditMode
							? 'Atualize o papel canônico, o grupo de acesso e as credenciais deste usuário.'
							: 'Cadastre um novo acesso e vincule o usuário ao grupo que governa seus toggles.'}
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex max-h-[calc(100vh-10rem)] flex-col"
					noValidate
					onSubmit={handleSubmit}
				>
					<div className="space-y-5 overflow-y-auto px-6 py-6">
						{submitError ? (
							<div className="flex items-start gap-2.5 rounded-md border border-[#f1c7c4] bg-[#fff7f7] px-3 py-2.5 text-[0.82rem] text-[#7a2f2a]">
								<AlertCircle className="mt-0.5 size-4 shrink-0 text-[#c65a52]" />
								<p className="leading-5">{submitError}</p>
							</div>
						) : null}

						<div className="grid gap-5 md:grid-cols-2">
							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="users-form-name">Nome completo</Label>
								<Input
									className="h-10 rounded-md border-[#d6dce5] shadow-none focus-visible:border-[#2d3648]/45"
									id="users-form-name"
									placeholder="Maria Silva"
									{...form.register('name')}
								/>
								{form.formState.errors.name ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="users-form-email">E-mail</Label>
								<Input
									className="h-10 rounded-md border-[#d6dce5] shadow-none focus-visible:border-[#2d3648]/45"
									id="users-form-email"
									placeholder="maria@leadcrm.com"
									type="email"
									{...form.register('email')}
								/>
								{form.formState.errors.email ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.email.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="users-form-role">Papel canônico</Label>
								<select
									className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="users-form-role"
									onChange={(event) =>
										form.setValue(
											'role',
											event.target.value as UserRecord['role'],
											{ shouldDirty: true, shouldValidate: true },
										)
									}
									value={selectedRole}
								>
									{roleOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<p className="text-xs leading-5 text-[#6b7687]">
									{getRoleCardCopy(selectedRole)}
								</p>
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="users-form-access-group">Grupo de acesso</Label>
								<select
									className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="users-form-access-group"
									onChange={(event) =>
										form.setValue(
											'accessGroupId',
											event.target.value.length > 0 ? event.target.value : null,
											{ shouldDirty: true, shouldValidate: true },
										)
									}
									value={form.watch('accessGroupId') ?? ''}
								>
									<option value="" disabled>
										Selecione um grupo
									</option>
									{availableAccessGroups.map((group) => (
										<option key={group.id} value={group.id}>
											{group.name}
										</option>
									))}
								</select>
								{form.formState.errors.accessGroupId ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.accessGroupId.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="users-form-password">
									{isEditMode ? 'Nova senha (opcional)' : 'Senha inicial'}
								</Label>
								<Input
									className="h-10 rounded-md border-[#d6dce5] shadow-none focus-visible:border-[#2d3648]/45"
									id="users-form-password"
									placeholder={
										isEditMode
											? 'Deixe em branco para manter a atual'
											: 'Mínimo de 8 caracteres'
									}
									type="password"
									{...form.register('password')}
								/>
								{form.formState.errors.password ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							className="rounded-md"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending}
							type="submit"
						>
							{isPending
								? isEditMode
									? 'Salvando...'
									: 'Criando...'
								: isEditMode
									? 'Salvar alterações'
									: 'Criar usuário'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function ConfirmDialog({
	title,
	description,
	error,
	isPending,
	onClose,
	onConfirm,
	open,
}: DeleteDialogProps) {
	return (
		<Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
			<DialogContent className="p-0 sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 px-6 py-6">
					<div className="rounded-2xl border border-[#f1d6d4] bg-[#fff7f7] p-4 text-sm leading-6 text-[#7a2f2a]">
						A ação será aplicada imediatamente e não pode ser revertida pela
						interface.
					</div>

					{error ? (
						<div className="flex items-start gap-2.5 rounded-md border border-[#f1c7c4] bg-[#fff7f7] px-3 py-2.5 text-[0.82rem] text-[#7a2f2a]">
							<AlertCircle className="mt-0.5 size-4 shrink-0 text-[#c65a52]" />
							<p className="leading-5">{error}</p>
						</div>
					) : null}
				</div>

				<DialogFooter>
					<Button className="rounded-md" onClick={onClose} variant="outline">
						Cancelar
					</Button>
					<Button
						className="rounded-md"
						disabled={isPending}
						onClick={() => {
							void onConfirm();
						}}
						variant="destructive"
					>
						{isPending ? 'Processando...' : 'Confirmar exclusão'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export {
	ConfirmDialog,
	formatTeamLabel,
	getRoleBadgeClassName,
	getRoleCardCopy,
	getRoleLabel,
	getUsersErrorMessage,
	UsersFormDialog,
};
