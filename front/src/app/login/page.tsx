import type { Metadata } from 'next';

import { LoginForm } from '@/features/login/components/LoginForm';

const metadata: Metadata = {
	title: 'Entrar | Sistema de Gestão de Leads',
	description:
		'Autenticação do Sistema de Gestão de Leads com Dashboard Analítico.',
};

function LoginPage() {
	return <LoginForm />;
}

export { metadata };
export default LoginPage;
