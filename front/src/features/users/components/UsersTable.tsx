'use client';

import {
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
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
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

import type { AccessGroup, UserRecord } from '../types/users.types';
import {
	getBaseRoleLabel,
	getFeatureLabels,
	getRoleBadgeClassName,
} from './AccessGroupForm';
import { formatTeamLabel, getRoleCardCopy, getRoleLabel } from './UserForm';

type UsersListSectionProps = {
	adminCount: number;
	filteredUsers: UserRecord[];
	isLoading: boolean;
	limit: number;
	onCreate: () => void;
	onDelete: (user: UserRecord) => void;
	onEdit: (user: UserRecord) => void;
	onLimitChange: (value: number) => void;
	onNextPage: () => void;
	onPreviousPage: () => void;
	onRoleFilterChange: (value: 'ALL' | UserRecord['role']) => void;
	onSearchChange: (value: string) => void;
	page: number;
	roleFilter: 'ALL' | UserRecord['role'];
	search: string;
	totalPages: number;
	totalUsers: number;
	users: UserRecord[];
	usersError: string | null;
	withoutGroupCount: number;
};

type AccessGroupsSectionProps = {
	accessGroups: AccessGroup[];
	error: string | null;
	isLoading: boolean;
	onCreate: () => void;
	onDelete: (group: AccessGroup) => void;
	onEdit: (group: AccessGroup) => void;
};

function UsersListSection({
	adminCount,
	filteredUsers,
	isLoading,
	limit,
	onCreate,
	onDelete,
	onEdit,
	onLimitChange,
	onNextPage,
	onPreviousPage,
	onRoleFilterChange,
	onSearchChange,
	page,
	roleFilter,
	search,
	totalPages,
	totalUsers,
	users,
	usersError,
	withoutGroupCount,
}: UsersListSectionProps) {
	return (
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
								Cada usuário já pode ser associado a um grupo persistido na API.
							</CardDescription>
						</div>

						<div className="flex flex-1 flex-col gap-3 md:flex-row lg:max-w-2xl lg:justify-end">
							<div className="relative md:max-w-sm md:flex-1">
								<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#97a2b1]" />
								<Input
									className="h-10 rounded-md border-[#d6dce5] bg-[#f8fafc] pl-9 shadow-none focus-visible:border-[#2d3648]/45"
									onChange={(event) => onSearchChange(event.target.value)}
									placeholder="Pesquisar por nome, e-mail ou grupo"
									value={search}
								/>
							</div>

							<select
								className="h-10 rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
								onChange={(event) =>
									onRoleFilterChange(
										event.target.value as 'ALL' | UserRecord['role'],
									)
								}
								value={roleFilter}
							>
								<option value="ALL">Todos os papéis</option>
								<option value="ATTENDANT">Atendente</option>
								<option value="MANAGER">Gerente</option>
								<option value="GENERAL_MANAGER">Gerente geral</option>
								<option value="ADMINISTRATOR">Administrador</option>
							</select>

							<Button
								className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
								onClick={onCreate}
								size="sm"
							>
								<Plus className="size-4" />
								Novo usuário
							</Button>
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
									<TableHead className="w-[4.5rem] text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="[&_tr]:border-[#e6ecf3]">
								{isLoading ? (
									<TableRow>
										<TableCell
											className="px-4 py-8 text-center text-sm text-[#6b7687]"
											colSpan={6}
										>
											Carregando usuários...
										</TableCell>
									</TableRow>
								) : usersError ? (
									<TableRow>
										<TableCell
											className="px-4 py-8 text-center text-sm text-destructive"
											colSpan={6}
										>
											{usersError}
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
											className="odd:bg-[#f8fafc]/40 hover:bg-[#f8fafc]/80"
											key={user.id}
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
															<span className="sr-only">Ações do usuário</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align="end"
														className="w-44 rounded-xl bg-white"
													>
														<DropdownMenuItem
															className="cursor-pointer rounded-lg px-3 py-2 text-[#1b2430] hover:!bg-[#d96c3f]/10 hover:!text-[#D96C3F]"
															onSelect={() => onEdit(user)}
														>
															<PencilLine className="size-4" />
															Editar
														</DropdownMenuItem>
														<DropdownMenuItem
															className="cursor-pointer rounded-lg px-3 py-2"
															onSelect={() => onDelete(user)}
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
								onChange={(event) => onLimitChange(Number(event.target.value))}
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
								disabled={page <= 1 || isLoading}
								onClick={onPreviousPage}
								size="icon-sm"
								variant="outline"
							>
								<ChevronLeft className="size-4" />
							</Button>
							<Button
								className="rounded-md"
								disabled={page >= Math.max(totalPages, 1) || isLoading}
								onClick={onNextPage}
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
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h3 className="text-[1.2rem] font-semibold text-[#1b2430]">
						Grupos de acesso
					</h3>
					<p className="text-sm leading-6 text-[#6b7687]">
						Esses grupos já são persistidos na API e controlam os toggles do
						front.
					</p>
				</div>
				<Button
					className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
					onClick={onCreate}
					size="sm"
				>
					<Plus className="size-4" />
					Novo grupo
				</Button>
			</div>

			{isLoading ? (
				<Card className="border-border/85 bg-white">
					<CardContent className="p-6 text-sm text-[#6b7687]">
						Carregando grupos de acesso...
					</CardContent>
				</Card>
			) : error ? (
				<Card className="border-border/85 bg-white">
					<CardContent className="p-6 text-sm text-destructive">
						{error}
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
													onSelect={() => onEdit(group)}
												>
													<PencilLine className="size-4" />
													Editar grupo
												</DropdownMenuItem>
												{!group.isSystemGroup ? (
													<DropdownMenuItem
														className="cursor-pointer rounded-lg px-3 py-2"
														onSelect={() => onDelete(group)}
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
										{getFeatureLabels(group.featureKeys).map((featureLabel) => (
											<Badge
												className="rounded-md border border-[#d6dce5] bg-white px-2.5 py-1 text-[0.72rem] text-[#2d3648]"
												key={featureLabel}
												variant="outline"
											>
												{featureLabel}
											</Badge>
										))}
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
	);
}

function UsersTabs(props: {
	accessGroups: AccessGroup[];
	accessGroupsError: string | null;
	accessGroupsLoading: boolean;
	adminCount: number;
	filteredUsers: UserRecord[];
	limit: number;
	onCreateAccessGroup: () => void;
	onCreateUser: () => void;
	onDeleteAccessGroup: (group: AccessGroup) => void;
	onDeleteUser: (user: UserRecord) => void;
	onEditAccessGroup: (group: AccessGroup) => void;
	onEditUser: (user: UserRecord) => void;
	onLimitChange: (value: number) => void;
	onNextPage: () => void;
	onPreviousPage: () => void;
	onRoleFilterChange: (value: 'ALL' | UserRecord['role']) => void;
	onSearchChange: (value: string) => void;
	page: number;
	roleFilter: 'ALL' | UserRecord['role'];
	search: string;
	totalPages: number;
	totalUsers: number;
	users: UserRecord[];
	usersError: string | null;
	usersLoading: boolean;
	withoutGroupCount: number;
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
					adminCount={props.adminCount}
					filteredUsers={props.filteredUsers}
					isLoading={props.usersLoading}
					limit={props.limit}
					onCreate={props.onCreateUser}
					onDelete={props.onDeleteUser}
					onEdit={props.onEditUser}
					onLimitChange={props.onLimitChange}
					onNextPage={props.onNextPage}
					onPreviousPage={props.onPreviousPage}
					onRoleFilterChange={props.onRoleFilterChange}
					onSearchChange={props.onSearchChange}
					page={props.page}
					roleFilter={props.roleFilter}
					search={props.search}
					totalPages={props.totalPages}
					totalUsers={props.totalUsers}
					users={props.users}
					usersError={props.usersError}
					withoutGroupCount={props.withoutGroupCount}
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

export { AccessGroupsSection, UsersListSection, UsersTabs };
