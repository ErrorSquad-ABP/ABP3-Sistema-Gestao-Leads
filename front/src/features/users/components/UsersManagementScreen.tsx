'use client';

import { useState } from 'react';

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
import type {
	AccessGroup,
	UserRecord,
	UsersSummary,
} from '../model/users.model';
import { AccessGroupDialog } from './AccessGroupForm';
import {
	ConfirmDialog,
	getUsersErrorMessage,
	UsersFormDialog,
} from './UserForm';
import { UsersTabs } from './UsersTable';

const emptySummary: UsersSummary = {
	administrators: 0,
	total: 0,
	withMultipleGroups: 0,
	withoutGroup: 0,
};

function UsersManagementScreen() {
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<'ALL' | UserRecord['role']>(
		'ALL',
	);
	const [accessGroupFilter, setAccessGroupFilter] = useState('');
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

	const usersQuery = useUsersQuery({
		accessGroupId: accessGroupFilter || undefined,
		limit,
		page,
		role: roleFilter === 'ALL' ? undefined : roleFilter,
		search: search.trim() || undefined,
	});
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
	const summary = usersPage?.summary ?? emptySummary;
	const usersError = usersQuery.isError
		? getUsersErrorMessage(usersQuery.error)
		: null;
	const accessGroupsError = accessGroupsQuery.isError
		? getUsersErrorMessage(accessGroupsQuery.error)
		: null;

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
				accessGroupIds: payload.accessGroupIds,
				email: payload.email,
				name: payload.name,
				password: payload.password,
				role: payload.role,
				teamId: null,
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
				accessGroupIds: payload.accessGroupIds,
				email: payload.email,
				name: payload.name,
				password:
					payload.password.trim().length > 0 ? payload.password : undefined,
				role: payload.role,
				teamId: selectedUser.teamId,
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
		<div className="space-y-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
						Usuários
					</h1>
					<p className="mt-2 text-sm text-[#667085]">
						Gerencie acessos, papéis e grupos. As permissões de cada usuário
						somam as features de todos os grupos vinculados.
					</p>
				</div>
			</div>

			<UsersTabs
				accessGroupFilter={accessGroupFilter}
				accessGroups={accessGroups}
				accessGroupsError={accessGroupsError}
				accessGroupsLoading={accessGroupsQuery.isLoading}
				limit={limit}
				onAccessGroupFilterChange={(value) => {
					setAccessGroupFilter(value);
					setPage(1);
				}}
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
				onRoleFilterChange={(value) => {
					setRoleFilter(value);
					setPage(1);
				}}
				onSearchChange={(value) => {
					setSearch(value);
					setPage(1);
				}}
				page={page}
				roleFilter={roleFilter}
				search={search}
				summary={summary}
				totalPages={totalPages}
				totalUsers={totalUsers}
				users={users}
				usersError={usersError}
				usersLoading={usersQuery.isLoading}
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
				description={`Excluir ${selectedAccessGroup?.name ?? 'este grupo'} removerá seus toggles e desvinculará os usuários associados.`}
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
		</div>
	);
}

export { UsersManagementScreen };
