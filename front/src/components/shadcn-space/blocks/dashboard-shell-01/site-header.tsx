import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
	return (
		<div className="flex w-full items-center justify-between">
			<div className="flex items-center">
				<SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
			</div>
			<div className="flex items-center gap-3" />
		</div>
	);
}
