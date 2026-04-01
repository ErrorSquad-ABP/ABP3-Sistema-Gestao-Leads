import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
		<html lang="pt-BR" className={cn("font-sans", geist.variable)}>
			<body>{children}</body>
		</html>
	);
}

export { metadata };
export default RootLayout;
