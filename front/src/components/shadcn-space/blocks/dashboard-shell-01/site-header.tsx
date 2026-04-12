import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserDropdown from '@/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

function getInitials(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.at(0)?.toUpperCase() ?? '')
		.join('');
}

export function SiteHeader({
	currentUser,
}: {
	currentUser: AuthenticatedUser;
}) {
	return (
		<div className="flex w-full items-center justify-between">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
				<div className="relative w-full max-w-sm">
					<SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-9 border-border/75 bg-background pl-9 shadow-none"
						placeholder="Pesquisar"
					/>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<UserDropdown
					currentUser={currentUser}
					defaultOpen={false}
					align="center"
					trigger={
						<div className="rounded-full">
							<Avatar className="size-8 cursor-pointer">
								<AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
							</Avatar>
						</div>
					}
				/>
			</div>
		</div>
	);
}
