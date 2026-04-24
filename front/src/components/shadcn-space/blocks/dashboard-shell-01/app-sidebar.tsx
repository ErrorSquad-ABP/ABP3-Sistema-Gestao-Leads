'use client';

import type { ReactNode } from 'react';
import {
	BarChart3,
	Building2,
	Car,
	ClipboardList,
	ContactRound,
	Handshake,
	LayoutPanelTop,
	type LucideIcon,
	ShieldCheck,
	Users,
} from 'lucide-react';
import SimpleBar from 'simplebar-react';

import type { AuthenticatedUser } from '@/features/login/types/login.types';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarProvider,
} from '@/components/ui/sidebar';
import {
	getNavigationItemsForUser,
	type AppNavigationItem,
} from '@/lib/auth/permissions';
import { SiteHeader } from '@/components/shadcn-space/blocks/dashboard-shell-01/site-header';
import { NavMain } from '@/components/shadcn-space/blocks/dashboard-shell-01/nav-main';
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

const iconByLabel: Record<AppNavigationItem['key'], LucideIcon> = {
	customers: ContactRound,
	dashboardAnalytic: BarChart3,
	dashboardOperational: LayoutPanelTop,
	leads: ClipboardList,
	deals: Handshake,
	vehicles: Car,
	stores: Building2,
	teams: Users,
	users: ShieldCheck,
};

const sectionByKey: Record<AppNavigationItem['key'], string> = {
	customers: 'Workspace',
	dashboardAnalytic: 'Dashboards',
	dashboardOperational: 'Dashboards',
	leads: 'Workspace',
	deals: 'Workspace',
	vehicles: 'Workspace',
	stores: 'Administração',
	teams: 'Administração',
	users: 'Administração',
};

function buildNavData(currentUser: AuthenticatedUser): NavItem[] {
	const items = getNavigationItemsForUser(currentUser);
	const grouped = new Map<string, NavItem[]>();

	for (const item of items) {
		const section = sectionByKey[item.key];
		const sectionItems = grouped.get(section) ?? [];

		sectionItems.push({
			href: item.href,
			icon: iconByLabel[item.key],
			title: item.label,
		});

		grouped.set(section, sectionItems);
	}

	return Array.from(grouped.entries()).flatMap(([label, sectionItems]) => [
		{ isSection: true, label },
		...sectionItems,
	]);
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
		<SidebarProvider>
			<Sidebar className="border-r border-r-border/75 bg-background px-0 py-4">
				<div className="flex flex-col gap-4 bg-background">
					{/* ---------------- Header ---------------- */}
					<SidebarHeader className="py-0 px-4">
						<div className="flex items-center gap-3 px-1 py-1.5">
							<div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-[0_0_0_6px_rgba(241,226,218,0.24)]">
								lc
							</div>
							<div className="space-y-0.5">
								<p className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-[#D96C3F]">
									Lead CRM
								</p>
								<p className="text-sm text-muted-foreground">Dashboard Shell</p>
							</div>
						</div>
					</SidebarHeader>

					{/* ---------------- Content ---------------- */}
					<SidebarContent className="overflow-hidden gap-0 px-0">
						<SimpleBar
							autoHide={true}
							className="h-[calc(100vh-112px)] [&_.simplebar-content-wrapper]:overflow-x-hidden [&_.simplebar-track.simplebar-horizontal]:hidden"
						>
							<div className="px-4">
								<NavMain items={navData} />
							</div>
						</SimpleBar>
					</SidebarContent>
				</div>
			</Sidebar>

			{/* ---------------- Main ---------------- */}
			<div className="flex flex-1 flex-col">
				<header className="sticky top-0 z-50 flex items-center border-b border-border/75 bg-background px-6 py-3">
					<SiteHeader currentUser={currentUser} />
				</header>
				<main className="flex-1">
					<div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 p-6">
						<div className="col-span-12">{children}</div>
					</div>
				</main>
			</div>
		</SidebarProvider>
	);
};

export default AppSidebar;
