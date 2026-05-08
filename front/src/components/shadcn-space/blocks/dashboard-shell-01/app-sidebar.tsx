'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import {
	Building2,
	Car,
	ClipboardList,
	ChartColumn,
	ChevronDown,
	Handshake,
	Home,
	type LucideIcon,
	Users,
	UserCog,
	UserRound,
} from 'lucide-react';
import SimpleBar from 'simplebar-react';

import type { AuthenticatedUser } from '@/features/login/types/login.types';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarProvider,
	useSidebar,
} from '@/components/ui/sidebar';
import {
	type AppRouteAccessKey,
	hasFeatureAccess,
} from '@/lib/auth/permissions';
import { NavMain } from '@/components/shadcn-space/blocks/dashboard-shell-01/nav-main';
import UserDropdown from '@/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import 'simplebar-react/dist/simplebar.min.css';

export type NavItem = {
	label?: string;
	isSection?: boolean;
	title?: string;
	icon?: LucideIcon;
	href?: string;
	children?: NavItem[];
	isActive?: boolean;
};

type VisualNavItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	accessKey?: AppRouteAccessKey;
};

const NAV_DASHBOARD: VisualNavItem[] = [
	{
		title: 'Dashboard',
		href: '/app/dashboard/operational',
		icon: Home,
		accessKey: 'dashboardOperational',
	},
];

const NAV_WORKSPACE: VisualNavItem[] = [
	{
		title: 'Clientes',
		href: '/app/customers',
		icon: UserRound,
		accessKey: 'customers',
	},
	{
		title: 'Leads',
		href: '/app/leads',
		icon: ClipboardList,
		accessKey: 'leads',
	},
	{
		title: 'Negociações',
		href: '/app/deals',
		icon: Handshake,
		accessKey: 'deals',
	},
	{
		title: 'Veículos',
		href: '/app/vehicles',
		icon: Car,
		accessKey: 'vehicles',
	},
];

const NAV_ADMIN: VisualNavItem[] = [
	{
		title: 'Lojas',
		href: '/app/stores',
		icon: Building2,
		accessKey: 'stores',
	},
	{
		title: 'Equipes',
		href: '/app/teams',
		icon: Users,
		accessKey: 'teams',
	},
	{
		title: 'Usuários',
		href: '/app/users',
		icon: UserCog,
		accessKey: 'users',
	},
	{
		title: 'Relatórios',
		href: '/app/operations',
		icon: ChartColumn,
	},
];

function buildNavData(currentUser: AuthenticatedUser): NavItem[] {
	const dashboardItems = NAV_DASHBOARD.filter((item) =>
		item.accessKey ? hasFeatureAccess(currentUser, item.accessKey) : true,
	);

	const workspaceItems = NAV_WORKSPACE.filter((item) =>
		item.accessKey ? hasFeatureAccess(currentUser, item.accessKey) : true,
	);

	const adminItems = NAV_ADMIN.filter((item) =>
		item.accessKey ? hasFeatureAccess(currentUser, item.accessKey) : true,
	);

	const rows: NavItem[] = [];

	for (const item of dashboardItems) {
		rows.push({ href: item.href, icon: item.icon, title: item.title });
	}

	if (workspaceItems.length) {
		rows.push({ isSection: true, label: 'WORKSPACE' });
		for (const item of workspaceItems) {
			rows.push({ href: item.href, icon: item.icon, title: item.title });
		}
	}

	if (adminItems.length) {
		rows.push({ isSection: true, label: 'ADMINISTRAÇÃO' });
		for (const item of adminItems) {
			rows.push({ href: item.href, icon: item.icon, title: item.title });
		}
	}

	return rows;
}

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.at(0)?.toUpperCase() ?? '')
		.join('');
}

function SidebarLogo() {
	const { toggleSidebar } = useSidebar();

	return (
		<button
			type="button"
			onClick={toggleSidebar}
			className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-white/5 group-data-[collapsible=icon]:justify-center"
			aria-label="Alternar sidebar"
		>
			<div className="relative size-10 shrink-0">
				<Image
					src="/assets/dark-logo-removebg.png"
					alt="Quantum"
					fill
					className="object-contain"
					priority
				/>
			</div>
			<div className="leading-tight group-data-[collapsible=icon]:hidden">
				<p className="text-base font-semibold tracking-tight text-white">
					Quantum
				</p>
				<p className="text-xs font-medium tracking-[0.22em] text-slate-300">
					CRM
				</p>
			</div>
		</button>
	);
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const AppSidebar = ({
	children,
	currentUser,
}: {
	children: ReactNode;
	currentUser: AuthenticatedUser;
}) => {
	const navData = buildNavData(currentUser);

	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width-icon': '4.5rem',
				} as React.CSSProperties
			}
		>
			<Sidebar
				collapsible="icon"
				className="border-r-0 bg-sidebar px-0 py-0 text-sidebar-foreground"
			>
				<div className="flex h-full flex-col">
					{/* ---------------- Header ---------------- */}
					<SidebarHeader className="px-5 pt-6 pb-4 group-data-[collapsible=icon]:px-2">
						<SidebarLogo />
					</SidebarHeader>

					{/* ---------------- Content ---------------- */}
					<SidebarContent className="overflow-hidden gap-0 px-0">
						<SimpleBar
							autoHide={true}
							className="h-[calc(100vh-220px)] [&_.simplebar-content-wrapper]:overflow-x-hidden [&_.simplebar-track.simplebar-horizontal]:hidden"
						>
							<div className="px-5 group-data-[collapsible=icon]:px-2">
								<NavMain items={navData} />
							</div>
						</SimpleBar>
					</SidebarContent>

					{/* ---------------- Footer ---------------- */}
					<SidebarFooter className="mt-auto gap-3 px-4 pb-4 group-data-[collapsible=icon]:px-2">
						<UserDropdown
							currentUser={currentUser}
							defaultOpen={false}
							align="start"
							trigger={
								<div className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 hover:bg-white/5 group-data-[collapsible=icon]:justify-center">
									<Avatar className="size-10 shrink-0 cursor-pointer bg-[#0e223b]">
										<AvatarFallback className="bg-transparent text-sm font-semibold text-white">
											{getInitials(currentUser.name)}
										</AvatarFallback>
									</Avatar>
									<div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
										<p className="truncate text-sm font-semibold text-white">
											{currentUser.name}
										</p>
										<p className="truncate text-xs text-slate-300">
											{currentUser.email}
										</p>
									</div>
									<ChevronDown className="size-4 text-slate-300 group-data-[collapsible=icon]:hidden" />
								</div>
							}
						/>
					</SidebarFooter>
				</div>
			</Sidebar>

			{/* ---------------- Main ---------------- */}
			<div className="flex flex-1 flex-col">
				<main className="relative flex-1">
					<div className="grid w-full grid-cols-12 gap-4 px-3 py-4 md:px-4 lg:px-5">
						<div className="col-span-12">{children}</div>
					</div>
				</main>
			</div>
		</SidebarProvider>
	);
};

export default AppSidebar;
