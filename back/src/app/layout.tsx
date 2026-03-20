import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

const metadata: Metadata = {
	title: 'ErrorSquad-ABP | API',
	description:
		'Aplicação de API em Next.js para o Sistema de Gestão de Leads com Dashboard Analítico.',
};

type RootLayoutProps = {
	children: ReactNode;
};

function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="pt-BR">
			<body>{children}</body>
		</html>
	);
}

export { metadata };
export default RootLayout;
