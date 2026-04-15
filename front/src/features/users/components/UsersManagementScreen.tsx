'use client';

import { Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import {
	useCreateAccessGroupMutation,
	useCreateUserMutation,
	useDeleteAccessGroupMutation,
	useDeleteUserMutation,
	useUpdateAccessGroupMutation,
	useUpdateUserMutation,
} from '../hooks/users.mutations';
import { useAccessGroupsQuery, useUsersQuery } from '../hooks/users.queries';
import type {
	AccessGroupFormValues,
	CreateUserFormValues,
	UpdateUserFormValues,
} from '../schemas/user-management.schema';
import type { AccessGroup, UserRecord } from '../types/users.types';
import { AccessGroupDialog } from './AccessGroupForm';
import {
	ConfirmDialog,
	getUsersErrorMessage,
	UsersFormDialog,
} from './UserForm';
import { UsersTabs } from './UsersTable';

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
	const usersError = usersQuery.isError
		? getUsersErrorMessage(usersQuery.error)
		: null;
	const accessGroupsError = accessGroupsQuery.isError
		? getUsersErrorMessage(accessGroupsQuery.error)
		: null;

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

						<CardAction className="static" />
					</div>
				</CardHeader>
			</Card>

			<UsersTabs
				accessGroups={accessGroups}
				accessGroupsError={accessGroupsError}
				accessGroupsLoading={accessGroupsQuery.isLoading}
				adminCount={adminCount}
				filteredUsers={filteredUsers}
				limit={limit}
				onCreateAccessGroup={openCreateAccessGroupDialog}
				onCreateUser={openCreateDialog}
				onDeleteAccessGroup={openDeleteAccessGroupDialog}
				onDeleteUser={openDeleteDialog}
				onEditAccessGroup={openEditAccessGroupDialog}
				onEditUser={openEditDialog}
				onLimitChange={(value) => {
					setLimit(value);
					setPage(1);
				}}
				onNextPage={() => setPage((current) => current + 1)}
				onPreviousPage={() => setPage((current) => current - 1)}
				onRoleFilterChange={setRoleFilter}
				onSearchChange={setSearch}
				page={page}
				roleFilter={roleFilter}
				search={search}
				totalPages={totalPages}
				totalUsers={totalUsers}
				users={users}
				usersError={usersError}
				usersLoading={usersQuery.isLoading}
				withoutGroupCount={withoutGroupCount}
			/>

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
