'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	AlertCircle,
	ChevronLeft,
	ChevronRight,
	KeyRound,
	LayoutList,
	MoreHorizontal,
	PencilLine,
	Plus,
	Search,
	ShieldCheck,
	Trash2,
	UserCog,
	Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isApiError } from '@/lib/http/api-error';
import { cn } from '@/lib/utils';

import {
	useCreateAccessGroupMutation,
	useCreateUserMutation,
	useDeleteAccessGroupMutation,
	useDeleteUserMutation,
	useUpdateAccessGroupMutation,
	useUpdateUserMutation,
} from '../hooks/users.mutations';
import { useAccessGroupsQuery, useUsersQuery } from '../hooks/users.queries';
import {
	accessGroupSchema,
	createUserSchema,
	updateUserSchema,
	type AccessGroupFormValues,
	type CreateUserFormValues,
	type UpdateUserFormValues,
} from '../schemas/user-management.schema';
import {
	roleLabels,
	roleOptions,
	type AccessFeatureKey,
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

type AccessGroupDialogProps = {
	group: AccessGroup | null;
	isPending: boolean;
	mode: 'create' | 'edit';
	onClose: () => void;
	onSubmit: (values: AccessGroupFormValues) => Promise<void>;
	open: boolean;
};

type AccessFeatureOption = {
	key: AccessFeatureKey;
	label: string;
	description: string;
};

const accessFeatureCatalog: readonly AccessFeatureOption[] = [
	{
		key: 'dashboardOperational',
		label: 'Dashboard operacional',
		description: 'Indicadores diários, execução e acompanhamento do time.',
	},
	{
		key: 'dashboardAnalytic',
		label: 'Dashboard analítico',
		description: 'Leitura consolidada de desempenho e conversão.',
	},
	{
		key: 'leads',
		label: 'Leads',
		description: 'Fluxo comercial, priorização e acompanhamento de leads.',
	},
	{
		key: 'users',
		label: 'Usuários',
		description: 'CRUD administrativo de acessos e perfis.',
	},
	{
		key: 'profile',
		label: 'Perfil',
		description: 'Área de dados pessoais e apresentação do usuário.',
	},
	{
		key: 'credentials',
		label: 'Credenciais',
		description: 'Troca de senha e governança de acesso individual.',
	},
	{
		key: 'reports',
		label: 'Relatórios',
		description: 'Leitura consolidada e acompanhamento gerencial.',
	},
	{
		key: 'exports',
		label: 'Exportações',
		description: 'Saída de dados e downloads operacionais.',
	},
] as const;

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

function getFeatureLabels(featureKeys: readonly AccessFeatureKey[]) {
	return accessFeatureCatalog
		.filter((feature) => featureKeys.includes(feature.key))
		.map((feature) => feature.label);
}

function getBaseRoleLabel(role: AccessGroup['baseRole']) {
	if (!role) {
		return 'Grupo flexível';
	}

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

function AccessGroupDialog({
	group,
	isPending,
	mode,
	onClose,
	onSubmit,
	open,
}: AccessGroupDialogProps) {
	const isEditMode = mode === 'edit';
	const [submitError, setSubmitError] = useState<string | null>(null);
	const form = useForm<AccessGroupFormValues>({
		resolver: zodResolver(accessGroupSchema),
		defaultValues: {
			name: '',
			description: '',
			baseRole: null,
			featureKeys: ['profile'],
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset({
				name: '',
				description: '',
				baseRole: null,
				featureKeys: ['profile'],
			});
			setSubmitError(null);
			return;
		}

		if (group) {
			form.reset({
				name: group.name,
				description: group.description,
				baseRole: group.baseRole,
				featureKeys: group.featureKeys,
			});
		}
	}, [form, group, open]);

	const selectedFeatures = form.watch('featureKeys');

	function toggleFeature(featureKey: AccessFeatureKey, checked: boolean) {
		const current = form.getValues('featureKeys');
		form.setValue(
			'featureKeys',
			checked
				? Array.from(new Set([...current, featureKey]))
				: current.filter((item) => item !== featureKey),
			{ shouldDirty: true, shouldValidate: true },
		);
	}

	return (
		<Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? 'Editar grupo de acesso' : 'Novo grupo de acesso'}
					</DialogTitle>
					<DialogDescription>
						Defina o papel-base e as features que esse grupo libera na
						aplicação.
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex max-h-[calc(100vh-10rem)] flex-col"
					noValidate
					onSubmit={form.handleSubmit(async (values) => {
						setSubmitError(null);
						try {
							await onSubmit(values);
							onClose();
						} catch (error) {
							setSubmitError(getUsersErrorMessage(error));
						}
					})}
				>
					<div className="grid gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
						<div className="space-y-5">
							{submitError ? (
								<div className="flex items-start gap-2.5 rounded-md border border-[#f1c7c4] bg-[#fff7f7] px-3 py-2.5 text-[0.82rem] text-[#7a2f2a]">
									<AlertCircle className="mt-0.5 size-4 shrink-0 text-[#c65a52]" />
									<p className="leading-5">{submitError}</p>
								</div>
							) : null}

							<div className="space-y-1.5">
								<Label htmlFor="access-group-name">Nome do grupo</Label>
								<Input
									className="h-10 rounded-md border-[#d6dce5] shadow-none focus-visible:border-[#2d3648]/45"
									id="access-group-name"
									placeholder="Gerentes regionais"
									{...form.register('name')}
								/>
								{form.formState.errors.name ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="access-group-description">Descrição</Label>
								<textarea
									className="flex min-h-28 w-full rounded-md border border-[#d6dce5] bg-white px-3 py-2 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="access-group-description"
									placeholder="Explique quando esse grupo deve ser usado."
									{...form.register('description')}
								/>
								{form.formState.errors.description ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.description.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="access-group-role">Papel canônico</Label>
								<select
									className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="access-group-role"
									onChange={(event) =>
										form.setValue(
											'baseRole',
											event.target.value === 'NONE'
												? null
												: (event.target
														.value as AccessGroupFormValues['baseRole']),
											{ shouldDirty: true, shouldValidate: true },
										)
									}
									value={form.watch('baseRole') ?? 'NONE'}
								>
									<option value="NONE">Sem vínculo canônico</option>
									{roleOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="space-y-4">
							<div className="rounded-2xl border border-border/80 bg-[#f8fafc] p-4">
								<p className="text-sm font-medium text-[#1b2430]">
									Feature toggles persistidos
								</p>
								<p className="mt-2 text-sm leading-6 text-[#6b7687]">
									O grupo é salvo na API e já governa navegação e gates do
									front.
								</p>
							</div>

							<div className="grid gap-3">
								{accessFeatureCatalog.map((feature) => {
									const checked = selectedFeatures.includes(feature.key);

									return (
										<label
											className={cn(
												'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors',
												checked
													? 'border-[#d96c3f]/25 bg-[#d96c3f]/8'
													: 'border-border/80 bg-white hover:border-[#d96c3f]/20 hover:bg-[#fff9f6]',
											)}
											key={feature.key}
										>
											<Checkbox
												checked={checked}
												className="mt-0.5 rounded-[4px] border-[#cbd5e1] data-checked:border-[#D96C3F] data-checked:bg-[#D96C3F]"
												onCheckedChange={(value) =>
													toggleFeature(feature.key, value === true)
												}
											/>
											<div className="space-y-1">
												<p className="text-sm font-medium text-[#1b2430]">
													{feature.label}
												</p>
												<p className="text-sm leading-6 text-[#6b7687]">
													{feature.description}
												</p>
											</div>
										</label>
									);
								})}
							</div>

							{form.formState.errors.featureKeys ? (
								<p className="text-xs text-destructive">
									{form.formState.errors.featureKeys.message}
								</p>
							) : null}
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
									? 'Salvar grupo'
									: 'Criar grupo'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function UsersManagementScreen() {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<'ALL' | UserRecord['role']>(
		'ALL',
	);
	const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
	const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [accessGroupDialogMode, setAccessGroupDialogMode] = useState<
		'create' | 'edit'
	>('create');
	const [selectedAccessGroup, setSelectedAccessGroup] =
		useState<AccessGroup | null>(null);
	const [isAccessGroupDialogOpen, setIsAccessGroupDialogOpen] = useState(false);
	const [isDeleteAccessGroupDialogOpen, setIsDeleteAccessGroupDialogOpen] =
		useState(false);
	const [deleteAccessGroupError, setDeleteAccessGroupError] = useState<
		string | null
	>(null);

	const usersQuery = useUsersQuery(page, limit);
	const accessGroupsQuery = useAccessGroupsQuery();
	const createUserMutation = useCreateUserMutation();
	const updateUserMutation = useUpdateUserMutation();
	const deleteUserMutation = useDeleteUserMutation();
	const createAccessGroupMutation = useCreateAccessGroupMutation();
	const updateAccessGroupMutation = useUpdateAccessGroupMutation();
	const deleteAccessGroupMutation = useDeleteAccessGroupMutation();

	const usersPage = usersQuery.data;
	const accessGroups = accessGroupsQuery.data ?? [];
	const users = usersPage?.items ?? [];
	const totalUsers = usersPage?.total ?? 0;
	const totalPages = usersPage?.totalPages ?? 0;

	const filteredUsers = useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase();

		return users.filter((user) => {
			const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
			const matchesSearch =
				normalizedSearch.length === 0 ||
				user.name.toLowerCase().includes(normalizedSearch) ||
				user.email.toLowerCase().includes(normalizedSearch) ||
				user.accessGroup?.name.toLowerCase().includes(normalizedSearch);

			return matchesRole && matchesSearch;
		});
	}, [roleFilter, search, users]);

	const adminCount = users.filter(
		(user) => user.role === 'ADMINISTRATOR',
	).length;
	const withoutGroupCount = users.filter(
		(user) => user.accessGroupId === null,
	).length;

	function openCreateDialog() {
		setDialogMode('create');
		setSelectedUser(null);
		setIsFormDialogOpen(true);
	}

	function openEditDialog(user: UserRecord) {
		setDialogMode('edit');
		setSelectedUser(user);
		setIsFormDialogOpen(true);
	}

	function openDeleteDialog(user: UserRecord) {
		setSelectedUser(user);
		setDeleteError(null);
		setIsDeleteDialogOpen(true);
	}

	function openCreateAccessGroupDialog() {
		setAccessGroupDialogMode('create');
		setSelectedAccessGroup(null);
		setIsAccessGroupDialogOpen(true);
	}

	function openEditAccessGroupDialog(group: AccessGroup) {
		setAccessGroupDialogMode('edit');
		setSelectedAccessGroup(group);
		setIsAccessGroupDialogOpen(true);
	}

	function openDeleteAccessGroupDialog(group: AccessGroup) {
		setSelectedAccessGroup(group);
		setDeleteAccessGroupError(null);
		setIsDeleteAccessGroupDialogOpen(true);
	}

	async function handleSubmitForm(
		values: CreateUserFormValues | UpdateUserFormValues,
	) {
		if (dialogMode === 'create') {
			const payload = values as CreateUserFormValues;
			await createUserMutation.mutateAsync({
				email: payload.email,
				name: payload.name,
				password: payload.password,
				role: payload.role,
				teamId: null,
				accessGroupId: payload.accessGroupId,
			});
			return;
		}

		if (!selectedUser) {
			return;
		}

		const payload = values as UpdateUserFormValues;
		await updateUserMutation.mutateAsync({
			userId: selectedUser.id,
			payload: {
				email: payload.email,
				name: payload.name,
				password:
					payload.password.trim().length > 0 ? payload.password : undefined,
				role: payload.role,
				teamId: selectedUser.teamId,
				accessGroupId: payload.accessGroupId,
			},
		});
	}

	async function handleDeleteConfirm() {
		if (!selectedUser) {
			return;
		}

		setDeleteError(null);

		try {
			await deleteUserMutation.mutateAsync(selectedUser.id);
			setIsDeleteDialogOpen(false);
			setSelectedUser(null);
		} catch (error) {
			setDeleteError(getUsersErrorMessage(error));
		}
	}

	async function handleSubmitAccessGroup(values: AccessGroupFormValues) {
		if (accessGroupDialogMode === 'create') {
			await createAccessGroupMutation.mutateAsync(values);
			return;
		}

		if (!selectedAccessGroup) {
			return;
		}

		await updateAccessGroupMutation.mutateAsync({
			groupId: selectedAccessGroup.id,
			payload: values,
		});
	}

	async function handleDeleteAccessGroupConfirm() {
		if (!selectedAccessGroup) {
			return;
		}

		setDeleteAccessGroupError(null);

		try {
			await deleteAccessGroupMutation.mutateAsync(selectedAccessGroup.id);
			setIsDeleteAccessGroupDialogOpen(false);
			setSelectedAccessGroup(null);
		} catch (error) {
			setDeleteAccessGroupError(getUsersErrorMessage(error));
		}
	}

	return (
		<section className="space-y-6">
			<Card className="border-border/85 bg-white">
				<CardHeader className="gap-5 pb-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-2">
							<div className="flex size-12 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
								<Users className="size-5" />
							</div>
							<p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#D96C3F]">
								Administração
							</p>
							<CardTitle className="text-[1.9rem] font-semibold tracking-tight">
								Acessos e grupos do sistema
							</CardTitle>
							<CardDescription className="max-w-3xl text-[0.95rem] leading-7">
								Centralize provisionamento, regras de acesso e toggles de
								features em um único módulo administrativo.
							</CardDescription>
						</div>

						<CardAction className="static">
							<Button
								className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
								onClick={openCreateDialog}
								size="sm"
							>
								<Plus className="size-4" />
								Novo usuário
							</Button>
						</CardAction>
					</div>
				</CardHeader>
			</Card>

			<Tabs className="space-y-0" defaultValue="users">
				<TabsList>
					<TabsTrigger value="users">
						<LayoutList className="mr-2 size-4" />
						Usuários
					</TabsTrigger>
					<TabsTrigger value="access">
						<ShieldCheck className="mr-2 size-4" />
						Regras e grupos de acesso
					</TabsTrigger>
				</TabsList>

				<TabsContent value="users">
					<div className="space-y-6">
						<div className="grid gap-4 lg:grid-cols-4">
							{[
								['Total cadastrado', totalUsers],
								['Nesta página', users.length],
								['Administradores', adminCount],
								['Sem grupo', withoutGroupCount],
							].map(([label, value]) => (
								<Card
									className="border-border/75 bg-[#f8fafc] shadow-none"
									key={label}
								>
									<CardContent className="p-4">
										<p className="text-xs uppercase tracking-[0.14em] text-[#6b7687]">
											{label}
										</p>
										<p className="mt-3 text-3xl font-semibold text-[#1b2430]">
											{value}
										</p>
									</CardContent>
								</Card>
							))}
						</div>

						<Card className="border-border/85 bg-white">
							<CardHeader className="gap-4 border-b border-border/75 pb-5">
								<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
									<div>
										<CardTitle className="text-[1.2rem] font-semibold text-[#1b2430]">
											Lista de usuários
										</CardTitle>
										<CardDescription className="mt-1 text-sm leading-6 text-[#6b7687]">
											Cada usuário já pode ser associado a um grupo persistido
											na API.
										</CardDescription>
									</div>

									<div className="flex flex-1 flex-col gap-3 md:flex-row lg:max-w-2xl lg:justify-end">
										<div className="relative md:max-w-sm md:flex-1">
											<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#97a2b1]" />
											<Input
												className="h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
												onChange={(event) => setSearch(event.target.value)}
												placeholder="Pesquisar por nome, e-mail ou grupo"
												value={search}
											/>
										</div>

										<select
											className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
											onChange={(event) =>
												setRoleFilter(
													event.target.value as 'ALL' | UserRecord['role'],
												)
											}
											value={roleFilter}
										>
											<option value="ALL">Todos os papéis</option>
											{roleOptions.map((option) => (
												<option key={option.value} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-5 pt-6">
								<div className="overflow-hidden rounded-2xl border border-border/80">
									<Table>
										<TableHeader className="[&_tr]:border-[#e6ecf3]">
											<TableRow className="bg-[#f8fafc] hover:bg-[#f8fafc]">
												<TableHead className="px-4">Nome</TableHead>
												<TableHead>E-mail</TableHead>
												<TableHead>Papel</TableHead>
												<TableHead>Grupo</TableHead>
												<TableHead>Equipe</TableHead>
												<TableHead className="w-[4.5rem] text-right">
													Ações
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody className="[&_tr]:border-[#e6ecf3]">
											{usersQuery.isLoading ? (
												<TableRow>
													<TableCell
														className="px-4 py-8 text-center text-sm text-[#6b7687]"
														colSpan={6}
													>
														Carregando usuários...
													</TableCell>
												</TableRow>
											) : usersQuery.isError ? (
												<TableRow>
													<TableCell
														className="px-4 py-8 text-center text-sm text-destructive"
														colSpan={6}
													>
														{getUsersErrorMessage(usersQuery.error)}
													</TableCell>
												</TableRow>
											) : filteredUsers.length === 0 ? (
												<TableRow>
													<TableCell
														className="px-4 py-8 text-center text-sm text-[#6b7687]"
														colSpan={6}
													>
														Nenhum usuário encontrado para os filtros atuais.
													</TableCell>
												</TableRow>
											) : (
												filteredUsers.map((user) => (
													<TableRow
														key={user.id}
														className="odd:bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80"
													>
														<TableCell className="px-4">
															<div className="space-y-1">
																<p className="font-medium text-[#1b2430]">
																	{user.name}
																</p>
																<p className="text-xs text-[#6b7687]">
																	{getRoleCardCopy(user.role)}
																</p>
															</div>
														</TableCell>
														<TableCell className="text-sm text-[#1b2430]">
															{user.email}
														</TableCell>
														<TableCell>
															<Badge
																className={cn(
																	'rounded-md border px-2.5 py-1 text-[0.72rem] font-medium',
																	getRoleBadgeClassName(user.role),
																)}
																variant="outline"
															>
																{getRoleLabel(user.role)}
															</Badge>
														</TableCell>
														<TableCell className="text-sm text-[#6b7687]">
															{user.accessGroup?.name ?? 'Sem grupo'}
														</TableCell>
														<TableCell className="text-sm text-[#6b7687]">
															{formatTeamLabel(user.teamId)}
														</TableCell>
														<TableCell className="text-right">
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button
																		className="rounded-md"
																		size="icon-sm"
																		variant="ghost"
																	>
																		<MoreHorizontal className="size-4" />
																		<span className="sr-only">
																			Ações do usuário
																		</span>
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent
																	align="end"
																	className="w-44 rounded-xl bg-white"
																>
																	<DropdownMenuItem
																		className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:!bg-[#d96c3f]/10 hover:!text-[#D96C3F]"
																		onSelect={() => openEditDialog(user)}
																	>
																		<PencilLine className="size-4" />
																		Editar
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		className="cursor-pointer rounded-lg px-3 py-2"
																		onSelect={() => openDeleteDialog(user)}
																		variant="destructive"
																	>
																		<Trash2 className="size-4" />
																		Excluir
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</div>

								<div className="flex flex-col gap-3 border-t border-border/75 pt-4 lg:flex-row lg:items-center lg:justify-between">
									<div className="flex items-center gap-3 text-sm text-[#6b7687]">
										<span>Linhas por página</span>
										<select
											className="h-9 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
											onChange={(event) => {
												setLimit(Number(event.target.value));
												setPage(1);
											}}
											value={limit}
										>
											{[10, 20, 50, 100].map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									</div>

									<div className="flex items-center gap-2">
										<p className="mr-2 text-sm text-[#6b7687]">
											Página {page} de {Math.max(totalPages, 1)}
										</p>
										<Button
											className="rounded-md"
											disabled={page <= 1 || usersQuery.isLoading}
											onClick={() => setPage((current) => current - 1)}
											size="icon-sm"
											variant="outline"
										>
											<ChevronLeft className="size-4" />
										</Button>
										<Button
											className="rounded-md"
											disabled={
												page >= Math.max(totalPages, 1) || usersQuery.isLoading
											}
											onClick={() => setPage((current) => current + 1)}
											size="icon-sm"
											variant="outline"
										>
											<ChevronRight className="size-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="access">
					<div className="space-y-6">
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-1">
								<h3 className="text-[1.2rem] font-semibold text-[#1b2430]">
									Grupos de acesso
								</h3>
								<p className="text-sm leading-6 text-[#6b7687]">
									Esses grupos já são persistidos na API e controlam os toggles
									do front.
								</p>
							</div>
							<Button
								className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
								onClick={openCreateAccessGroupDialog}
								size="sm"
							>
								<Plus className="size-4" />
								Novo grupo
							</Button>
						</div>

						{accessGroupsQuery.isLoading ? (
							<Card className="border-border/85 bg-white">
								<CardContent className="p-6 text-sm text-[#6b7687]">
									Carregando grupos de acesso...
								</CardContent>
							</Card>
						) : accessGroupsQuery.isError ? (
							<Card className="border-border/85 bg-white">
								<CardContent className="p-6 text-sm text-destructive">
									{getUsersErrorMessage(accessGroupsQuery.error)}
								</CardContent>
							</Card>
						) : (
							<div className="grid gap-4 xl:grid-cols-2">
								{accessGroups.map((group) => (
									<Card className="border-border/85 bg-white" key={group.id}>
										<CardHeader className="gap-4 border-b border-border/75 pb-5">
											<div className="flex items-start justify-between gap-3">
												<div className="space-y-2">
													<Badge
														className={cn(
															'rounded-md border px-2.5 py-1 text-[0.72rem] font-medium',
															group.baseRole
																? getRoleBadgeClassName(group.baseRole)
																: 'border-[#d6dce5] bg-white text-[#6b7687]',
														)}
														variant="outline"
													>
														{getBaseRoleLabel(group.baseRole)}
													</Badge>
													<CardTitle className="text-[1.15rem] font-semibold text-[#1b2430]">
														{group.name}
													</CardTitle>
													<CardDescription className="text-sm leading-6 text-[#6b7687]">
														{group.description}
													</CardDescription>
												</div>

												<div className="flex items-center gap-2">
													<div className="flex size-10 items-center justify-center rounded-2xl border border-[#d96c3f]/16 bg-[#d96c3f]/10 text-[#d96c3f]">
														{group.baseRole === 'ADMINISTRATOR' ? (
															<UserCog className="size-4" />
														) : (
															<KeyRound className="size-4" />
														)}
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																className="rounded-md"
																size="icon-sm"
																variant="ghost"
															>
																<MoreHorizontal className="size-4" />
																<span className="sr-only">Ações do grupo</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="end"
															className="w-44 rounded-xl bg-white"
														>
															<DropdownMenuItem
																className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:!bg-[#d96c3f]/10 hover:!text-[#D96C3F]"
																onSelect={() =>
																	openEditAccessGroupDialog(group)
																}
															>
																<PencilLine className="size-4" />
																Editar grupo
															</DropdownMenuItem>
															{!group.isSystemGroup ? (
																<DropdownMenuItem
																	className="cursor-pointer rounded-lg px-3 py-2"
																	onSelect={() =>
																		openDeleteAccessGroupDialog(group)
																	}
																	variant="destructive"
																>
																	<Trash2 className="size-4" />
																	Excluir grupo
																</DropdownMenuItem>
															) : null}
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</CardHeader>

										<CardContent className="grid gap-5 pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.85fr)]">
											<div>
												<p className="text-sm font-medium text-[#1b2430]">
													Features habilitadas
												</p>
												<div className="mt-3 flex flex-wrap gap-2">
													{getFeatureLabels(group.featureKeys).map(
														(featureLabel) => (
															<Badge
																className="rounded-md border border-[#d6dce5] bg-white px-2.5 py-1 text-[0.72rem] text-[#2d3648]"
																key={featureLabel}
																variant="outline"
															>
																{featureLabel}
															</Badge>
														),
													)}
												</div>
											</div>

											<div className="rounded-2xl border border-border/80 bg-[#f8fafc] p-4">
												<p className="text-sm font-medium text-[#1b2430]">
													Leitura operacional
												</p>
												<p className="mt-3 text-sm leading-6 text-[#6b7687]">
													{group.isSystemGroup
														? 'Grupo canônico do produto, com vínculo estável ao papel validado no backend.'
														: 'Grupo customizado persistido na API. O front já usa seus toggles para esconder ou liberar módulos.'}
												</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>

			<UsersFormDialog
				accessGroups={accessGroups}
				isPending={createUserMutation.isPending || updateUserMutation.isPending}
				mode={dialogMode}
				onClose={() => setIsFormDialogOpen(false)}
				onSubmit={handleSubmitForm}
				open={isFormDialogOpen}
				user={selectedUser}
			/>

			<ConfirmDialog
				description={`Excluir ${selectedUser?.name ?? 'este usuário'} removerá o acesso do ambiente atual.`}
				error={deleteError}
				isPending={deleteUserMutation.isPending}
				onClose={() => {
					setDeleteError(null);
					setIsDeleteDialogOpen(false);
				}}
				onConfirm={handleDeleteConfirm}
				open={isDeleteDialogOpen}
				title="Excluir usuário"
			/>

			<AccessGroupDialog
				group={selectedAccessGroup}
				isPending={
					createAccessGroupMutation.isPending ||
					updateAccessGroupMutation.isPending
				}
				mode={accessGroupDialogMode}
				onClose={() => setIsAccessGroupDialogOpen(false)}
				onSubmit={handleSubmitAccessGroup}
				open={isAccessGroupDialogOpen}
			/>

			<ConfirmDialog
				description={`Excluir ${selectedAccessGroup?.name ?? 'este grupo'} removerá seus toggles e desvinculará novos usos administrativos.`}
				error={deleteAccessGroupError}
				isPending={deleteAccessGroupMutation.isPending}
				onClose={() => {
					setDeleteAccessGroupError(null);
					setIsDeleteAccessGroupDialogOpen(false);
				}}
				onConfirm={handleDeleteAccessGroupConfirm}
				open={isDeleteAccessGroupDialogOpen}
				title="Excluir grupo de acesso"
			/>
		</section>
	);
}

export { UsersManagementScreen };
