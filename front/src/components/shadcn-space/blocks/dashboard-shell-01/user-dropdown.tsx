'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type LucideIcon, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { queryKeys } from '@/lib/constants/query-keys';
import { appRoutes } from '@/lib/routes/app-routes';
import { logout } from '@/features/login/api/login.service';

type Props = {
	trigger: ReactNode;
	currentUser: AuthenticatedUser;
	defaultOpen?: boolean;
	align?: 'start' | 'center' | 'end';
};

type MenuItem = {
	label: string;
	icon: LucideIcon;
};

const MANAGE_ACCOUNT_ITEMS: MenuItem[] = [
	{ label: 'Perfil', icon: ShieldCheck },
	{ label: 'Credenciais', icon: Mail },
];

const LOGOUT_ITEM: MenuItem = {
	label: 'Sair',
	icon: LogOut,
};

const itemClass =
	'cursor-pointer gap-2 rounded-xl bg-transparent p-2 text-sm font-medium text-popover-foreground data-[highlighted]:!bg-transparent focus:!bg-transparent';

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.at(0)?.toUpperCase() ?? '')
		.join('');
}

const UserDropdown = ({
	trigger,
	currentUser,
	defaultOpen,
	align = 'end',
}: Props) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [highlightedItem, setHighlightedItem] = useState<string | null>(null);

	const canManageUsers = currentUser.role === 'ADMINISTRATOR';

	async function handleLogout() {
		setIsLoggingOut(true);

		try {
			await logout();
		} finally {
			queryClient.setQueryData(queryKeys.auth.currentUser, null);
			await queryClient.cancelQueries({ queryKey: queryKeys.auth.currentUser });
			router.replace(appRoutes.auth.login);
			router.refresh();
			setIsLoggingOut(false);
		}
	}

	function isHighlighted(label: string) {
		return highlightedItem === label;
	}

	return (
		<div className="flex items-center justify-center">
			<DropdownMenu defaultOpen={defaultOpen}>
				<DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
				<DropdownMenuContent
					align={align}
					className="w-3xs rounded-2xl data-open:slide-in-from-bottom-20! data-closed:slide-out-to-bottom-20 data-open:fade-in-0 data-closed:fade-out-0 data-closed:zoom-out-100 duration-400 [&_[data-slot=dropdown-menu-item][data-highlighted]]:!bg-transparent"
				>
					{/* User Info */}
					<DropdownMenuGroup>
						<DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
							<div className="relative">
								<Avatar className="data-[size=lg]:size-8">
									<AvatarFallback>
										{getInitials(currentUser.name)}
									</AvatarFallback>
								</Avatar>
								<span className="ring-card absolute right-0 bottom-0 size-2 rounded-full bg-green-600 ring-2" />
							</div>

							<div className="flex flex-col">
								<span className="text-popover-foreground text-sm font-medium">
									{currentUser.name}
								</span>
								<span className="text-muted-foreground text-sm">
									{currentUser.email}
								</span>
							</div>
						</DropdownMenuLabel>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Main Links */}
					{canManageUsers ? (
						<DropdownMenuGroup>
							{MANAGE_ACCOUNT_ITEMS.map(({ label, icon: Icon }) => (
								<DropdownMenuItem
									key={label}
									className={itemClass}
									onFocus={() => setHighlightedItem(label)}
									onPointerMove={() => setHighlightedItem(label)}
									onPointerLeave={() => setHighlightedItem(null)}
									onSelect={() => router.push(appRoutes.app.users)}
									style={{
										backgroundColor: 'transparent',
										color: isHighlighted(label) ? '#D96C3F' : undefined,
									}}
								>
									<Icon
										style={{
											color: isHighlighted(label) ? '#D96C3F' : undefined,
										}}
										size={20}
									/>
									<span
										style={{
											color: isHighlighted(label) ? '#D96C3F' : undefined,
										}}
									>
										{label}
									</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuGroup>
					) : null}

					{canManageUsers ? <DropdownMenuSeparator /> : null}

					{/* Logout */}
					<DropdownMenuItem
						className={itemClass}
						disabled={isLoggingOut}
						onFocus={() => setHighlightedItem(LOGOUT_ITEM.label)}
						onPointerMove={() => setHighlightedItem(LOGOUT_ITEM.label)}
						onPointerLeave={() => setHighlightedItem(null)}
						onSelect={(event) => {
							event.preventDefault();
							void handleLogout();
						}}
						style={{
							backgroundColor: 'transparent',
							color: isHighlighted(LOGOUT_ITEM.label) ? '#D96C3F' : undefined,
						}}
					>
						<LOGOUT_ITEM.icon
							style={{
								color: isHighlighted(LOGOUT_ITEM.label) ? '#D96C3F' : undefined,
							}}
							size={20}
						/>
						<span
							style={{
								color: isHighlighted(LOGOUT_ITEM.label) ? '#D96C3F' : undefined,
							}}
						>
							{isLoggingOut ? 'Saindo...' : LOGOUT_ITEM.label}
						</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default UserDropdown;
