import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Providers } from '@/lib/query/providers';

import './styles.css';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
});

const metadata: Metadata = {
	title: 'ErrorSquad-ABP | Sistema de Gestão de Leads',
	description:
		'Aplicação web em Next.js para o Sistema de Gestão de Leads com Dashboard Analítico.',
};

type RootLayoutProps = {
	children: ReactNode;
};

function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="pt-BR">
			<body
				className={`${inter.className} min-h-screen bg-background font-sans text-foreground antialiased`}
			>
				<TooltipProvider>
					<Providers>{children}</Providers>
				</TooltipProvider>
			</body>
		</html>
	);
}

export { metadata };
export default RootLayout;
