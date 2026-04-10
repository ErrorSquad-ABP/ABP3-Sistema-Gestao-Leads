import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/features/login/components/ForgotPasswordForm';

const metadata: Metadata = {
	title: 'Esqueci a Senha | Sistema de Gestão de Leads',
	description: 'Recuperação de acesso ao Sistema de Gestão de Leads.',
};

function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}

export { metadata };
export default ForgotPasswordPage;
