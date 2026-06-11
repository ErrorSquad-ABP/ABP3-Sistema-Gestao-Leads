const API_ERROR_CODE_MESSAGES: Readonly<Record<string, string>> = {
	'auth.invalid_credentials': 'Credenciais inválidas. Verifique o e-mail e a senha informados.',
	'auth.refresh_invalid':
		'Sessão expirada. Autentique-se novamente para continuar.',
	'customer.email_already_exists': 'Já existe um cliente com este e-mail.',
	'customer.cpf_already_exists': 'Já existe um cliente com este CPF.',
	'customer.not_found': 'Cliente não encontrado.',
	'deal.active_already_exists':
		'Este lead já possui uma negociação aberta.',
	'deal.already_closed':
		'Esta negociação já está encerrada e não pode ser alterada.',
	'deal.not_found': 'Negociação não encontrada.',
	'deal.vehicle.active_already_exists':
		'Este veículo já possui uma negociação aberta.',
	'deal.vehicle.not_available': 'O veículo selecionado não está disponível.',
	'deal.vehicle.store_mismatch':
		'O veículo selecionado não pertence à mesma loja do lead.',
	'lead.access.denied': 'O seu perfil não tem permissão para esta operação.',
	'lead.already_converted': 'Este lead já foi convertido.',
	'lead.invalid_customer': 'Cliente inválido para este lead.',
	'lead.invalid_owner': 'Responsável inválido para este lead.',
	'lead.invalid_store': 'Loja inválida para este lead.',
	'lead.not_found': 'Lead não encontrado.',
	'store.delete_blocked':
		'Não é possível remover a loja porque ainda existem vínculos ativos.',
	'store.not_found': 'Loja não encontrada.',
	'team.access.denied': 'O seu perfil não tem permissão para esta operação.',
	'team.invalid_manager': 'Gerente inválido para esta equipe.',
	'team.invalid_store': 'Loja inválida para esta equipe.',
	'team.not_found': 'Equipe não encontrada.',
	'user.email_already_exists': 'Já existe um usuário com este e-mail.',
	'user.password.unchanged':
		'A nova senha deve ser diferente da senha atual.',
	'user.invalid_access_group': 'Grupo de acesso inválido.',
	'user.not_found': 'Usuário não encontrado.',
	'vehicle.delete_blocked':
		'Não é possível remover o veículo porque ainda existem vínculos ativos.',
	'vehicle.inactive': 'O veículo selecionado está inativo.',
	'vehicle.not_found': 'Veículo não encontrado.',
};

const API_ERROR_CODE_FIELDS: Readonly<Record<string, string>> = {
	'customer.cpf_already_exists': 'cpf',
	'customer.email_already_exists': 'email',
	'user.email_already_exists': 'email',
};

export { API_ERROR_CODE_FIELDS, API_ERROR_CODE_MESSAGES };
