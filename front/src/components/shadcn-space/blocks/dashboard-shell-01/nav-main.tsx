'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function NavMain({ items }: { items: NavItem[] }) {
	const pathname = usePathname();
	const menuItemClassName =
		'h-9 rounded-md !bg-transparent px-3 py-2 text-sm text-sidebar-foreground shadow-none transition-colors hover:!bg-[#D96C3F]/10 hover:!text-[#D96C3F]';

	// Recursive render function
	const renderItem = (item: NavItem) => {
		//  Section label
		if (item.isSection && item.label) {
			return (
				<SidebarGroup key={item.label} className="p-0 pt-5 first:pt-0">
					<SidebarGroupLabel className="p-0 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
						{item.label}
					</SidebarGroupLabel>
				</SidebarGroup>
			);
		}
		const hasChildren = !!item.children?.length;
		// Item with children → collapsible
		if (hasChildren && item.title) {
			return (
				<SidebarGroup key={item.title} className="p-0">
					<SidebarMenu>
						<Collapsible>
							<SidebarMenuItem>
								<CollapsibleTrigger
									asChild
									className="w-full collapsible/button"
								>
									<SidebarMenuButton
										tooltip={item.title}
										className={cn(menuItemClassName, 'cursor-pointer')}
									>
										{item.icon && <item.icon size={16} />}
										<span>{item.title}</span>
										<ChevronRight className="ml-auto transition-transform duration-200 collapsible/button-[aria-expanded='true']:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub className="me-0 pe-0">
										{item.children!.map(renderItemSub)}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					</SidebarMenu>
				</SidebarGroup>
			);
		}
		// Item without children
		if (item.title) {
			const isActive = item.isActive ?? pathname === item.href;

			return (
				<SidebarGroup key={item.title} className="p-0">
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								isActive={false}
								tooltip={item.title}
								className={cn(
									menuItemClassName,
									isActive ? 'font-medium text-sidebar-foreground' : '',
								)}
							>
								<Link href={item.href ?? '#'}>
									{item.icon && <item.icon />}
									{item.title}
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			);
		}
		return null;
	};
	// Recursive render function for sub-items
	const renderItemSub = (item: NavItem) => {
		const hasChildren = !!item.children?.length;
		if (hasChildren && item.title) {
			return (
				<SidebarMenuSubItem key={item.title}>
					<Collapsible>
						<CollapsibleTrigger className="w-full">
							<SidebarMenuSubButton className="rounded-xl text-sm px-3 py-2 h-9">
								{item.icon && <item.icon />}
								<span>{item.title}</span>
								<ChevronRight className="ml-auto transition-transform duration-200 data-[state=open]:rotate-90" />
							</SidebarMenuSubButton>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarMenuSub className="me-0 pe-0">
								{item.children!.map(renderItemSub)}
							</SidebarMenuSub>
						</CollapsibleContent>
					</Collapsible>
				</SidebarMenuSubItem>
			);
		}
		if (item.title) {
			return (
				<SidebarMenuSubItem key={item.title} className="w-full">
					<SidebarMenuSubButton asChild className="w-full">
						<Link href={item.href ?? '#'}>{item.title}</Link>
					</SidebarMenuSubButton>
				</SidebarMenuSubItem>
			);
		}
		return null;
	};

	return <>{items.map(renderItem)}</>;
}
