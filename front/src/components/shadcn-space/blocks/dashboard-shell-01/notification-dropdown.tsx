'use client';

import type { ReactNode } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type LucideIcon, Star, Video } from 'lucide-react';

type Props = {
	trigger: ReactNode;
	defaultOpen?: boolean;
	align?: 'start' | 'center' | 'end';
};

type MenuItem = {
	textColor: string;
	bgColor: string;
	icon: LucideIcon;
	title: string;
	desc: string;
	time: string;
};

const PROFILE_ITEMS: MenuItem[] = [
	{
		textColor: 'text-[#D96C3F]',
		bgColor: 'bg-[#D96C3F]/10',
		icon: Star,
		title: 'Shell ativo',
		desc: 'A área autenticada já está pronta para receber os módulos reais.',
		time: 'Agora',
	},
	{
		textColor: 'text-[#2D3648]',
		bgColor: 'bg-[#2D3648]/10',
		icon: Video,
		title: 'Login concluído',
		desc: 'O bootstrap de sessão e o redirecionamento por papel já estão operacionais.',
		time: 'Hoje',
	},
];

const NotificationDropdown = ({
	trigger,
	defaultOpen,
	align = 'end',
}: Props) => {
	return (
		<div className="flex items-center justify-center">
			<DropdownMenu defaultOpen={defaultOpen}>
				<DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>

				<DropdownMenuContent
					align={align}
					className="p-0 w-sm rounded-2xl data-open:slide-in-from-top-20! data-closed:slide-out-to-top-20 data-open:fade-in-0 data-closed:fade-out-0 data-closed:zoom-out-100 duration-400"
				>
					{/* title */}
					<DropdownMenuGroup>
						<DropdownMenuLabel className="flex items-center justify-between p-4">
							<p className="text-base font-medium text-popover-foreground">
								Atualizações
							</p>
							<Badge className="font-normal leading-0">2 itens</Badge>
						</DropdownMenuLabel>
					</DropdownMenuGroup>

					{/* Notifications */}
					<DropdownMenuGroup>
						{PROFILE_ITEMS.map(
							({ bgColor, textColor, icon: Icon, title, desc, time }) => (
								<DropdownMenuItem
									key={title}
									className={
										'mx-1.5 my-1 p-2 flex items-center justify-between cursor-pointer'
									}
								>
									<div className="flex items-center gap-3">
										<div className={cn('p-2.5 rounded-xl', bgColor, textColor)}>
											<Icon size={20} className="size-5" />
										</div>
										<div>
											<p className="text-sm font-medium text-popover-foreground">
												{title}
											</p>
											<p className="max-w-52 truncate text-sm text-muted-foreground">
												{desc}
											</p>
										</div>
									</div>
									<p className="text-xs text-muted-foreground">{time}</p>
								</DropdownMenuItem>
							),
						)}
					</DropdownMenuGroup>

					{/* button */}
					<div className="mx-1.5 my-1 p-2">
						<Button className="rounded-xl w-full cursor-pointer h-9 hover:bg-primary/80">
							Fechar painel
						</Button>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default NotificationDropdown;
