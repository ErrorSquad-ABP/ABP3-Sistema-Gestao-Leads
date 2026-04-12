'use client';

import {
	BarChart3,
	Building2,
	LayoutDashboard,
	Shield,
	Users2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { UserRole } from '@/features/login/types/login.types';
import { appRoutes } from '@/lib/routes/app-routes';
import { cn } from '@/lib/utils';

type NavigationGroup = {
	items: NavigationItem[];
	label: string;
};

type NavigationItem = {
	description: string;
	href: string;
	icon: typeof LayoutDashboard;
	label: string;
	roles: readonly UserRole[];
};

const navigationGroups: readonly NavigationGroup[] = [
	{
		label: 'Visao geral',
		items: [
			{
				label: 'Dashboard analitico',
				href: appRoutes.app.dashboard.analytic,
				description: 'Indicadores e visao consolidada da operacao.',
				icon: BarChart3,
				roles: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
			},
			{
				label: 'Dashboard operacional',
				href: appRoutes.app.dashboard.operational,
				description: 'Acompanhamento tatico do time e das entregas.',
				icon: LayoutDashboard,
				roles: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
			},
		],
	},
	{
		label: 'Operacao',
		items: [
			{
				label: 'Leads',
				href: appRoutes.app.leads,
				description: 'Nucleo comercial com acompanhamento inicial.',
				icon: Users2,
				roles: ['ATTENDANT', 'MANAGER', 'ADMINISTRATOR'],
			},
			{
				label: 'Clientes',
				href: appRoutes.app.customers,
				description: 'Base protegida para cadastro e manutencao.',
				icon: Users2,
				roles: ['ATTENDANT', 'MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
			},
		],
	},
	{
		label: 'Administracao',
		items: [
			{
				label: 'Usuarios',
				href: appRoutes.app.users,
				description: 'Gestao administrativa de acessos e papeis.',
				icon: Shield,
				roles: ['ADMINISTRATOR'],
			},
			{
				label: 'Equipes',
				href: appRoutes.app.teams,
				description: 'Estrutura organizacional e vinculacao operacional.',
				icon: Users2,
				roles: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
			},
			{
				label: 'Lojas',
				href: appRoutes.app.stores,
				description: 'Base para distribuicao e vinculos comerciais.',
				icon: Building2,
				roles: ['MANAGER', 'GENERAL_MANAGER', 'ADMINISTRATOR'],
			},
		],
	},
] as const;

function isCurrentRoute(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

type AppShellNavigationProps = {
	role: UserRole;
};

function AppShellNavigation({ role }: AppShellNavigationProps) {
	const pathname = usePathname();
	const availableGroups = navigationGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => item.roles.includes(role)),
		}))
		.filter((group) => group.items.length > 0);

	return (
		<nav aria-label="Navegacao principal" className="space-y-6">
			{availableGroups.map((group) => (
				<div className="space-y-2.5" key={group.label}>
					<p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#8A95A5]">
						{group.label}
					</p>
					<div className="space-y-2">
						{group.items.map((item) => {
							const active = isCurrentRoute(pathname, item.href);
							const Icon = item.icon;

							return (
								<Link
									aria-current={active ? 'page' : undefined}
									className={cn(
										'group flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all',
										active
											? 'border-[#E7D7CF] bg-[#FFF8F3] text-[#1B2430] shadow-sm'
											: 'border-transparent text-[#516071] hover:border-white/70 hover:bg-white/75 hover:text-[#1B2430]',
									)}
									href={item.href}
									key={item.href}
								>
									<div
										className={cn(
											'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
											active
												? 'border-[#F0DED3] bg-white text-[#D96C3F]'
												: 'border-white/80 bg-white/65 text-[#6B7687] group-hover:border-[#E6EAF0] group-hover:bg-white',
										)}
									>
										<Icon className="size-4" />
									</div>
									<div className="min-w-0">
										<p className="text-sm font-semibold">{item.label}</p>
										<p className="mt-1 text-xs leading-5 text-[#6B7687]">
											{item.description}
										</p>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			))}
		</nav>
	);
}

export { AppShellNavigation };
