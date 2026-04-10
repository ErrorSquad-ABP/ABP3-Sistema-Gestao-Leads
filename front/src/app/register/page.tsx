import type { Metadata } from 'next';

import { RegisterForm } from '@/features/login/components/RegisterForm';

const metadata: Metadata = {
	title: 'Criar Conta | Sistema de Gestão de Leads',
	description: 'Solicitação de acesso ao Sistema de Gestão de Leads.',
};

function RegisterPage() {
	return <RegisterForm />;
}

export { metadata };
export default RegisterPage;
