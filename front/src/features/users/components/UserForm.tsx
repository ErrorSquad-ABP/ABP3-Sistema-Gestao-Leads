'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PencilLine, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
	AppModalConfirmPanel,
	AppModalHeader,
	appModalContentClass,
} from '@/components/modals/AppModal';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label, requiredFieldProps } from '@/components/ui/label';
import { ModalFormErrorBanner } from '@/components/feedback/ModalFormErrorBanner';
import { showCrudSuccessToast } from '@/lib/feedback/crud-success-toast';
import { applyFormSubmitErrors } from '@/lib/http/apply-api-form-errors';
import { cn } from '@/lib/utils';

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
} from '../model/users.model';

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

function getRoleBadgeClassName(role: UserRecord['role']) {
	switch (role) {
		case 'ADMINISTRATOR':
			return 'border-orange-100 bg-orange-50 text-[#c2410c]';
		case 'GENERAL_MANAGER':
			return 'border-violet-100 bg-violet-50 text-violet-700';
		case 'MANAGER':
			return 'border-blue-100 bg-blue-50 text-blue-700';
		case 'ATTENDANT':
			return 'border-emerald-100 bg-emerald-50 text-emerald-700';
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

function getDefaultAccessGroupIds(
	accessGroups: AccessGroup[],
	role: UserRecord['role'],
) {
	const matched =
		accessGroups.find((group) => group.baseRole === role) ??
		accessGroups.find((group) => group.baseRole === null);

	return matched ? [matched.id] : [];
}

function toggleAccessGroupId(current: string[], groupId: string) {
	if (current.includes(groupId)) {
		return current.filter((id) => id !== groupId);
	}

	return [...current, groupId];
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
			accessGroupIds: getDefaultAccessGroupIds(accessGroups, 'ATTENDANT'),
		},
	});
	const updateForm = useForm<UpdateUserFormValues>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			role: 'ATTENDANT',
			accessGroupIds: [],
		},
	});
	const form = isEditMode ? updateForm : createForm;
	const selectedRole = useWatch({
		control: form.control,
		name: 'role',
		defaultValue: 'ATTENDANT',
	});
	const selectedAccessGroupIds =
		useWatch({
			control: form.control,
			name: 'accessGroupIds',
		}) ?? [];

	useEffect(() => {
		if (!open) {
			return;
		}

		if (isEditMode && user) {
			updateForm.reset({
				name: user.name,
				email: user.email,
				password: '',
				role: user.role,
				accessGroupIds: [...user.accessGroupIds],
			});
			return;
		}

		createForm.reset({
			name: '',
			email: '',
			password: '',
			role: 'ATTENDANT',
			accessGroupIds: getDefaultAccessGroupIds(accessGroups, 'ATTENDANT'),
		});
	}, [accessGroups, createForm, isEditMode, open, updateForm, user]);

	function handleDialogOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			return;
		}

		setSubmitError(null);
		createForm.reset();
		updateForm.reset();
		onClose();
	}

	function handleToggleGroup(groupId: string) {
		form.setValue(
			'accessGroupIds',
			toggleAccessGroupId(selectedAccessGroupIds, groupId),
			{ shouldDirty: true, shouldValidate: true },
		);
	}

	const handleSubmit = form.handleSubmit(async (values) => {
		setSubmitError(null);

		try {
			await onSubmit(values);
			showCrudSuccessToast('user', isEditMode ? 'updated' : 'created');
			onClose();
		} catch (error) {
			setSubmitError(applyFormSubmitErrors(form.setError, error));
		}
	});

	return (
		<Dialog onOpenChange={handleDialogOpenChange} open={open}>
			<DialogContent className={`${appModalContentClass} sm:max-w-2xl`}>
				<AppModalHeader
					category="Usuários"
					description={
						isEditMode
							? 'Atualize papel, credenciais e os grupos de acesso deste usuário.'
							: 'Cadastre um novo acesso e vincule um ou mais grupos. As permissões somam as features de todos os grupos.'
					}
					icon={isEditMode ? PencilLine : UserPlus}
					title={isEditMode ? 'Editar usuário' : 'Novo usuário'}
					tone="violet"
				/>

				<form
					className="flex max-h-[calc(100vh-10rem)] flex-col"
					noValidate
					onSubmit={handleSubmit}
				>
					<div className="space-y-5 overflow-y-auto px-6 py-6">
						<ModalFormErrorBanner message={submitError} />

						<div className="grid gap-5 md:grid-cols-2">
							<div className="space-y-1.5 md:col-span-2">
								<Label htmlFor="users-form-name" required>
									Nome completo
								</Label>
								<Input
									className="h-11 rounded-xl border-[#d8e0ea] shadow-none focus-visible:border-[#f05a28]/45"
									id="users-form-name"
									placeholder="Maria Silva"
									{...form.register('name')}
									{...requiredFieldProps()}
								/>
								{form.formState.errors.name ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="users-form-email" required>
									E-mail
								</Label>
								<Input
									className="h-11 rounded-xl border-[#d8e0ea] shadow-none focus-visible:border-[#f05a28]/45"
									id="users-form-email"
									placeholder="maria@leadcrm.com"
									type="email"
									{...form.register('email')}
									{...requiredFieldProps()}
								/>
								{form.formState.errors.email ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.email.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="users-form-role" required>
									Papel canônico
								</Label>
								<select
									className="flex h-11 w-full rounded-xl border border-[#d8e0ea] bg-white px-3 text-sm text-[#101828] shadow-none transition-colors outline-none focus:border-[#f05a28]/45"
									id="users-form-role"
									onChange={(event) =>
										form.setValue(
											'role',
											event.target
												.value as UserRecord['role'],
											{
												shouldDirty: true,
												shouldValidate: true,
											},
										)
									}
									value={selectedRole}
									{...requiredFieldProps()}
								>
									{roleOptions.map((option) => (
										<option
											key={option.value}
											value={option.value}
										>
											{option.label}
										</option>
									))}
								</select>
								<p className="text-xs leading-5 text-[#667085]">
									{getRoleCardCopy(selectedRole)}
								</p>
							</div>

							<div className="space-y-1.5 md:col-span-2">
								<Label
									htmlFor="users-form-password"
									required={!isEditMode}
								>
									{isEditMode
										? 'Nova senha (opcional)'
										: 'Senha inicial'}
								</Label>
								<Input
									className="h-11 rounded-xl border-[#d8e0ea] shadow-none focus-visible:border-[#f05a28]/45"
									id="users-form-password"
									placeholder={
										isEditMode
											? 'Deixe em branco para manter a atual'
											: 'Mínimo de 8 caracteres'
									}
									type="password"
									{...form.register('password')}
									{...requiredFieldProps(!isEditMode)}
								/>
								{form.formState.errors.password ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.password.message}
									</p>
								) : null}
							</div>

							<div className="space-y-2.5 md:col-span-2">
								<div className="flex items-center justify-between">
									<Label>Grupos de acesso</Label>
									<span className="text-xs text-[#667085]">
										{selectedAccessGroupIds.length === 0
											? 'Nenhum grupo — acesso regido só pelo papel'
											: `${selectedAccessGroupIds.length} ${
													selectedAccessGroupIds.length ===
													1
														? 'grupo selecionado'
														: 'grupos selecionados'
												}`}
									</span>
								</div>
								<div className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-[#e7edf5] bg-[#f8fafc] p-3">
									{accessGroups.length === 0 ? (
										<p className="px-1 py-2 text-sm text-[#667085]">
											Nenhum grupo de acesso cadastrado.
										</p>
									) : (
										accessGroups.map((group) => {
											const isChecked =
												selectedAccessGroupIds.includes(
													group.id,
												);
											return (
												<label
													className={cn(
														'flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3 transition-colors',
														isChecked
															? 'border-[#f05a28]/45 ring-1 ring-[#f05a28]/20'
															: 'border-[#e7edf5] hover:border-[#d8e0ea]',
													)}
													key={group.id}
												>
													<Checkbox
														checked={isChecked}
														className="mt-0.5"
														onCheckedChange={() =>
															handleToggleGroup(
																group.id,
															)
														}
													/>
													<span className="min-w-0 flex-1">
														<span className="flex items-center gap-2">
															<span className="text-sm font-semibold text-[#101828]">
																{group.name}
															</span>
															<span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[0.68rem] font-medium text-[#c2410c]">
																<ShieldCheck className="size-3" />
																{
																	group
																		.featureKeys
																		.length
																}{' '}
																{group
																	.featureKeys
																	.length ===
																1
																	? 'feature'
																	: 'features'}
															</span>
														</span>
														<span className="mt-0.5 block truncate text-xs text-[#667085]">
															{group.description}
														</span>
													</span>
												</label>
											);
										})
									)}
								</div>
								<p className="text-xs leading-5 text-[#667085]">
									As permissões efetivas são a união das
									features de todos os grupos vinculados — sem
									herança entre grupos.
								</p>
								{form.formState.errors.accessGroupIds ? (
									<p className="text-xs text-destructive">
										{
											form.formState.errors.accessGroupIds
												.message
										}
									</p>
								) : null}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							className="rounded-xl"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="rounded-xl bg-[#101a33] text-white hover:bg-[#17223d]"
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
			<DialogContent className={`${appModalContentClass} sm:max-w-lg`}>
				<AppModalHeader
					category="Usuários"
					description={description}
					icon={Trash2}
					title={title}
					tone="danger"
				/>

				<div className="space-y-4 px-6 py-6">
					<AppModalConfirmPanel icon={Trash2}>
						A ação será aplicada imediatamente e não pode ser
						revertida pela interface.
					</AppModalConfirmPanel>

					<ModalFormErrorBanner message={error} />
				</div>

				<DialogFooter>
					<Button
						className="rounded-xl"
						onClick={onClose}
						variant="outline"
					>
						Cancelar
					</Button>
					<Button
						className="rounded-xl"
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
	UsersFormDialog,
};
