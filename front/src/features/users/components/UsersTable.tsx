'use client';

import {
	ChevronLeft,
	ChevronRight,
	KeyRound,
	LayoutList,
	Layers,
	MoreHorizontal,
	PencilLine,
	Plus,
	ShieldCheck,
	ShieldOff,
	Trash2,
	UserCog,
	Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { AppTableFilterDropdown } from '@/components/data/AppTableFilterDropdown';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import type {
	AccessGroup,
	UserRecord,
	UsersSummary,
} from '../model/users.model';
import {
	getBaseRoleLabel,
	getFeatureLabels,
	getRoleBadgeClassName,
} from './AccessGroupForm';
import { getRoleCardCopy, getRoleLabel } from './UserForm';

type UsersListSectionProps = {
	accessGroups: AccessGroup[];
	accessGroupFilter: string;
	isLoading: boolean;
	limit: number;
	onAccessGroupFilterChange: (value: string) => void;
	onDelete: (user: UserRecord) => void;
	onEdit: (user: UserRecord) => void;
	onLimitChange: (value: number) => void;
	onNextPage: () => void;
	onPreviousPage: () => void;
	onRoleFilterChange: (value: 'ALL' | UserRecord['role']) => void;
	page: number;
	roleFilter: 'ALL' | UserRecord['role'];
	summary: UsersSummary;
	totalUsers: number;
	totalPages: number;
	users: UserRecord[];
	usersError: string | null;
};

type AccessGroupsSectionProps = {
	accessGroups: AccessGroup[];
	error: string | null;
	isLoading: boolean;
	onCreate: () => void;
	onDelete: (group: AccessGroup) => void;
	onEdit: (group: AccessGroup) => void;
};

function formatUserInitials(name: string) {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return 'US';
	}
	const [first = '', second = ''] = words;
	return `${first[0] ?? ''}${second[0] ?? first[1] ?? ''}`.toUpperCase();
}

function UsersSummaryCards({ summary }: { summary: UsersSummary }) {
	const cards = [
		{
			helper: 'Usuários cadastrados no sistema',
			icon: Users,
			label: 'Total de usuários',
			tone: 'flex size-14 items-center justify-center rounded-full bg-orange-50 text-[#f05a28]',
			value: summary.total,
		},
		{
			helper: 'Acesso completo à administração',
			icon: UserCog,
			label: 'Administradores',
			tone: 'flex size-14 items-center justify-center rounded-full bg-violet-50 text-violet-600',
			value: summary.administrators,
		},
		{
			helper: 'Regidos apenas pelo papel canônico',
			icon: ShieldOff,
			label: 'Sem grupo',
			tone: 'flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600',
			value: summary.withoutGroup,
		},
		{
			helper: 'Permissões somadas por união de features',
			icon: Layers,
			label: 'Multi-grupo',
			tone: 'flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600',
			value: summary.withMultipleGroups,
		},
	];

	return (
		<div className="grid gap-4 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<Card
						className="rounded-3xl border-[#dfe7f1] bg-white"
						key={card.label}
					>
						<CardContent className="flex items-center gap-5 p-6">
							<div className={card.tone}>
								<Icon className="size-7" />
							</div>
							<div>
								<p className="text-sm font-medium text-[#667085]">
									{card.label}
								</p>
								<p className="mt-1 text-2xl font-bold text-[#101828]">
									{card.value}
								</p>
								<p className="mt-1 text-xs text-[#667085]">
									{card.helper}
								</p>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

function UserGroupsCell({ user }: { user: UserRecord }) {
	if (user.accessGroups.length === 0) {
		return <span className="text-sm text-[#667085]">Sem grupo</span>;
	}

	const visibleGroups = user.accessGroups.slice(0, 2);
	const hiddenCount = user.accessGroups.length - visibleGroups.length;

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{visibleGroups.map((group) => (
				<Badge
					className="rounded-full border-[#e7edf5] bg-[#f8fafc] px-2.5 py-0.5 text-xs font-medium text-[#1e293b]"
					key={group.id}
					variant="outline"
				>
					{group.name}
				</Badge>
			))}
			{hiddenCount > 0 ? (
				<Badge
					className="rounded-full border-orange-100 bg-orange-50 px-2 py-0.5 text-xs font-semibold text-[#c2410c]"
					variant="outline"
				>
					+{hiddenCount}
				</Badge>
			) : null}
		</div>
	);
}

function UsersListSection({
	accessGroups,
	accessGroupFilter,
	isLoading,
	limit,
	onAccessGroupFilterChange,
	onDelete,
	onEdit,
	onLimitChange,
	onNextPage,
	onPreviousPage,
	onRoleFilterChange,
	page,
	roleFilter,
	summary,
	totalPages,
	totalUsers,
	users,
	usersError,
}: UsersListSectionProps) {
	const safeTotalPages = Math.max(totalPages, 1);
	const firstVisibleItem = users.length === 0 ? 0 : (page - 1) * limit + 1;
	const lastVisibleItem = Math.min(page * limit, totalUsers);

	return (
		<div className="space-y-5">
			<div className="hidden">
				<UsersSummaryCards summary={summary} />
			</div>

			<Card className="overflow-hidden rounded-3xl border-[#dfe7f1] bg-white">
				<CardContent className="p-0">
					<div className="flex flex-col gap-2 p-4 lg:flex-row lg:items-center">
						<div className="flex flex-wrap items-center gap-2 lg:ml-auto">
							<AppTableFilterDropdown
								defaultValue="ALL"
								label="Papel"
								onValueChange={(value) =>
									onRoleFilterChange(
										value as 'ALL' | UserRecord['role'],
									)
								}
								options={[
									{ value: 'ALL', label: 'Todos os papéis' },
									{ value: 'ATTENDANT', label: 'Atendente' },
									{ value: 'MANAGER', label: 'Gerente' },
									{
										value: 'GENERAL_MANAGER',
										label: 'Gerente geral',
									},
									{
										value: 'ADMINISTRATOR',
										label: 'Administrador',
									},
								]}
								value={roleFilter}
							/>

							<AppTableFilterDropdown
								defaultValue=""
								label="Grupo de acesso"
								onValueChange={(value) =>
									onAccessGroupFilterChange(value)
								}
								options={[
									{ value: '', label: 'Todos os grupos' },
									...accessGroups.map((group) => ({
										value: group.id,
										label: group.name,
									})),
								]}
								value={accessGroupFilter}
							/>
						</div>
					</div>

					<div className="overflow-hidden border-t border-[#e7edf5]">
						<Table>
							<TableHeader className="bg-white">
								<TableRow className="border-[#e7edf5]">
									<TableHead className="w-[26%] pl-7 text-[#1e293b]">
										Usuário
									</TableHead>
									<TableHead className="w-[22%] text-[#1e293b]">
										E-mail
									</TableHead>
									<TableHead className="w-[14%] text-[#1e293b]">
										Papel
									</TableHead>
									<TableHead className="w-[22%] text-[#1e293b]">
										Grupos de acesso
									</TableHead>
									<TableHead className="w-[10%] text-[#1e293b]">
										Features
									</TableHead>
									<TableHead className="pr-6 text-right text-[#1e293b]">
										Ações
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow className="border-[#e7edf5]">
										<TableCell
											className="py-10 text-center text-sm text-[#667085]"
											colSpan={6}
										>
											Carregando usuários...
										</TableCell>
									</TableRow>
								) : usersError ? (
									<TableRow className="border-[#e7edf5]">
										<TableCell
											className="py-10 text-center text-sm text-destructive"
											colSpan={6}
										>
											{usersError}
										</TableCell>
									</TableRow>
								) : users.length === 0 ? (
									<TableRow className="border-[#e7edf5]">
										<TableCell
											className="py-10 text-center text-sm text-[#667085]"
											colSpan={6}
										>
											Nenhum usuário encontrado para os
											filtros atuais.
										</TableCell>
									</TableRow>
								) : (
									users.map((user) => (
										<TableRow
											className="h-[4.35rem] border-[#e7edf5] hover:bg-[#f8fafc]/80"
											key={user.id}
										>
											<TableCell className="pl-7">
												<div className="flex items-center gap-3">
													<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f1f4f8] text-xs font-semibold text-[#667085]">
														{formatUserInitials(
															user.name,
														)}
													</div>
													<div className="min-w-0">
														<p className="truncate font-semibold text-[#101828]">
															{user.name}
														</p>
														<p className="mt-0.5 truncate text-xs text-[#667085]">
															{getRoleCardCopy(
																user.role,
															)}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell className="text-sm font-medium text-[#1e293b]">
												{user.email}
											</TableCell>
											<TableCell>
												<Badge
													className={cn(
														'rounded-full border px-2.5 py-1 text-xs font-medium',
														getRoleBadgeClassName(
															user.role,
														),
													)}
													variant="outline"
												>
													{getRoleLabel(user.role)}
												</Badge>
											</TableCell>
											<TableCell>
												<UserGroupsCell user={user} />
											</TableCell>
											<TableCell>
												<span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e293b]">
													<ShieldCheck className="size-4 text-[#f05a28]" />
													{user.featureKeys.length}
												</span>
											</TableCell>
											<TableCell className="pr-6">
												<div className="flex justify-end">
													<DropdownMenu>
														<DropdownMenuTrigger
															asChild
														>
															<Button
																className="rounded-lg border-[#d8e0ea] shadow-none"
																size="icon-sm"
																variant="outline"
															>
																<MoreHorizontal className="size-4" />
																<span className="sr-only">
																	Ações do
																	usuário
																</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align="end"
															className="w-44 rounded-xl bg-white"
														>
															<DropdownMenuItem
																className="cursor-pointer rounded-lg px-3 py-2"
																onSelect={() =>
																	onEdit(user)
																}
															>
																<PencilLine className="size-4" />
																Editar
															</DropdownMenuItem>
															<DropdownMenuItem
																className="cursor-pointer rounded-lg px-3 py-2"
																onSelect={() =>
																	onDelete(
																		user,
																	)
																}
																variant="destructive"
															>
																<Trash2 className="size-4" />
																Excluir
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>

						<div className="grid gap-3 border-t border-[#e7edf5] px-7 py-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
							<p className="text-sm text-[#667085]">
								Mostrando {firstVisibleItem} a {lastVisibleItem}{' '}
								de {totalUsers} usuários
							</p>

							<div className="flex items-center justify-center gap-2">
								<Button
									className="rounded-lg border-[#d8e0ea]"
									disabled={page <= 1 || isLoading}
									onClick={onPreviousPage}
									size="icon-sm"
									variant="outline"
								>
									<ChevronLeft className="size-4" />
								</Button>
								<p className="px-2 text-sm font-medium text-[#1e293b]">
									Página {page} de {safeTotalPages}
								</p>
								<Button
									className="rounded-lg border-[#d8e0ea]"
									disabled={
										page >= safeTotalPages || isLoading
									}
									onClick={onNextPage}
									size="icon-sm"
									variant="outline"
								>
									<ChevronRight className="size-4" />
								</Button>
							</div>

							<div className="flex items-center justify-end gap-3 text-sm text-[#667085]">
								<span>Linhas por página</span>
								<select
									className="h-9 rounded-lg border border-[#d8e0ea] bg-white px-3 text-sm text-[#101828] outline-none"
									onChange={(event) =>
										onLimitChange(
											Number(event.target.value),
										)
									}
									value={limit}
								>
									{[10, 20, 50, 100].map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function AccessGroupsSection({
	accessGroups,
	error,
	isLoading,
	onCreate,
	onDelete,
	onEdit,
}: AccessGroupsSectionProps) {
	return (
		<div className="space-y-5">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h3 className="text-lg font-bold text-[#101828]">
						Grupos de acesso
					</h3>
					<p className="text-sm leading-6 text-[#667085]">
						Os grupos governam os toggles de features. Um usuário
						pode acumular vários grupos — as permissões somam, sem
						herança.
					</p>
				</div>
				<Button
					className="h-12 rounded-xl bg-[#f05a28] px-5 text-white shadow-none hover:bg-[#df4f1f]"
					onClick={onCreate}
				>
					<Plus className="size-4" />
					Novo grupo
				</Button>
			</div>

			{isLoading ? (
				<Card className="rounded-3xl border-[#dfe7f1] bg-white">
					<CardContent className="p-6 text-sm text-[#667085]">
						Carregando grupos de acesso...
					</CardContent>
				</Card>
			) : error ? (
				<Card className="rounded-3xl border-[#dfe7f1] bg-white">
					<CardContent className="p-6 text-sm text-destructive">
						{error}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 xl:grid-cols-2">
					{accessGroups.map((group) => (
						<Card
							className="rounded-3xl border-[#dfe7f1] bg-white"
							key={group.id}
						>
							<CardHeader className="gap-4 border-b border-[#e7edf5] pb-5">
								<div className="flex items-start justify-between gap-3">
									<div className="space-y-2">
										<Badge
											className={cn(
												'rounded-full border px-2.5 py-1 text-xs font-medium',
												group.baseRole
													? getRoleBadgeClassName(
															group.baseRole,
														)
													: 'border-[#d8e0ea] bg-white text-[#667085]',
											)}
											variant="outline"
										>
											{getBaseRoleLabel(group.baseRole)}
										</Badge>
										<CardTitle className="text-[1.15rem] font-bold text-[#101828]">
											{group.name}
										</CardTitle>
										<CardDescription className="text-sm leading-6 text-[#667085]">
											{group.description}
										</CardDescription>
									</div>

									<div className="flex items-center gap-2">
										<div className="flex size-10 items-center justify-center rounded-full bg-orange-50 text-[#f05a28]">
											{group.baseRole ===
											'ADMINISTRATOR' ? (
												<UserCog className="size-4" />
											) : (
												<KeyRound className="size-4" />
											)}
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													className="rounded-lg border-[#d8e0ea] shadow-none"
													size="icon-sm"
													variant="outline"
												>
													<MoreHorizontal className="size-4" />
													<span className="sr-only">
														Ações do grupo
													</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-44 rounded-xl bg-white"
											>
												<DropdownMenuItem
													className="cursor-pointer rounded-lg px-3 py-2"
													onSelect={() =>
														onEdit(group)
													}
												>
													<PencilLine className="size-4" />
													Editar grupo
												</DropdownMenuItem>
												{!group.isSystemGroup ? (
													<DropdownMenuItem
														className="cursor-pointer rounded-lg px-3 py-2"
														onSelect={() =>
															onDelete(group)
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
									<p className="text-sm font-semibold text-[#101828]">
										Features habilitadas
									</p>
									<div className="mt-3 flex flex-wrap gap-2">
										{getFeatureLabels(
											group.featureKeys,
										).map((featureLabel) => (
											<Badge
												className="rounded-full border-[#e7edf5] bg-[#f8fafc] px-2.5 py-1 text-xs text-[#1e293b]"
												key={featureLabel}
												variant="outline"
											>
												{featureLabel}
											</Badge>
										))}
									</div>
								</div>

								<div className="rounded-2xl border border-[#e7edf5] bg-[#f8fafc] p-4">
									<p className="text-sm font-semibold text-[#101828]">
										Leitura operacional
									</p>
									<p className="mt-3 text-sm leading-6 text-[#667085]">
										{group.isSystemGroup
											? 'Grupo canônico do produto, com vínculo estável ao papel validado no backend.'
											: 'Grupo customizado persistido na API. O front usa seus toggles para esconder ou liberar módulos.'}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function UsersTabs(props: {
	accessGroups: AccessGroup[];
	accessGroupFilter: string;
	accessGroupsError: string | null;
	accessGroupsLoading: boolean;
	limit: number;
	onAccessGroupFilterChange: (value: string) => void;
	onCreateAccessGroup: () => void;
	onDeleteAccessGroup: (group: AccessGroup) => void;
	onDeleteUser: (user: UserRecord) => void;
	onEditAccessGroup: (group: AccessGroup) => void;
	onEditUser: (user: UserRecord) => void;
	onLimitChange: (value: number) => void;
	onNextPage: () => void;
	onPreviousPage: () => void;
	onRoleFilterChange: (value: 'ALL' | UserRecord['role']) => void;
	page: number;
	roleFilter: 'ALL' | UserRecord['role'];
	summary: UsersSummary;
	totalPages: number;
	totalUsers: number;
	users: UserRecord[];
	usersError: string | null;
	usersLoading: boolean;
}) {
	return (
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
				<UsersListSection
					accessGroupFilter={props.accessGroupFilter}
					accessGroups={props.accessGroups}
					isLoading={props.usersLoading}
					limit={props.limit}
					onAccessGroupFilterChange={props.onAccessGroupFilterChange}
					onDelete={props.onDeleteUser}
					onEdit={props.onEditUser}
					onLimitChange={props.onLimitChange}
					onNextPage={props.onNextPage}
					onPreviousPage={props.onPreviousPage}
					onRoleFilterChange={props.onRoleFilterChange}
					page={props.page}
					roleFilter={props.roleFilter}
					summary={props.summary}
					totalPages={props.totalPages}
					totalUsers={props.totalUsers}
					users={props.users}
					usersError={props.usersError}
				/>
			</TabsContent>

			<TabsContent value="access">
				<AccessGroupsSection
					accessGroups={props.accessGroups}
					error={props.accessGroupsError}
					isLoading={props.accessGroupsLoading}
					onCreate={props.onCreateAccessGroup}
					onDelete={props.onDeleteAccessGroup}
					onEdit={props.onEditAccessGroup}
				/>
			</TabsContent>
		</Tabs>
	);
}

export { AccessGroupsSection, UsersListSection, UsersSummaryCards, UsersTabs };
