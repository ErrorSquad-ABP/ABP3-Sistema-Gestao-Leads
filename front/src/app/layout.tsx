import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Providers } from '@/lib/query/providers';

import './styles.css';

const metadata: Metadata = {
	title: 'Quantum | Sistema de Gestão de Leads',
	description:
		'Aplicação web em Next.js para o Sistema de Gestão de Leads com Dashboard Analítico.',
	icons: {
		icon: [
			{
				url: '/assets/light-logo-removebg.png',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/assets/dark-logo-removebg.png',
				media: '(prefers-color-scheme: dark)',
			},
			'/assets/light-logo-removebg.png',
		],
		shortcut: '/assets/light-logo-removebg.png',
		apple: '/assets/light-logo-removebg.png',
	},
};

type RootLayoutProps = {
	children: ReactNode;
};

function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="pt-BR">
			<body className="min-h-screen bg-background font-sans text-foreground antialiased">
				<TooltipProvider>
					<Providers>{children}</Providers>
					<Toaster />
				</TooltipProvider>
			</body>
		</html>
	);
}

export { metadata };
export default RootLayout;
