import type { AuthenticatedUser } from '@/features/login/types/login.types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import UserDropdown from '@/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
			<div className="flex items-center">
				<SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
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
