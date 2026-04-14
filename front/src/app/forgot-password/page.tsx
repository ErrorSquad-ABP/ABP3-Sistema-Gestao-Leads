import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/features/login/components/ForgotPasswordForm';

const metadata: Metadata = {
	title: 'Recuperação de Acesso | Sistema de Gestão de Leads',
	description:
		'Orientações para regularização de acesso ao Sistema de Gestão de Leads.',
};

function ForgotPasswordPage() {
	return <ForgotPasswordForm />;
}

export { metadata };
export default ForgotPasswordPage;
