import { toast } from 'sonner';

import { appToastStyle } from './app-toast-style';

type CrudAction = 'created' | 'updated' | 'deleted';

type CrudEntity =
	| 'lead'
	| 'customer'
	| 'store'
	| 'user'
	| 'accessGroup'
	| 'team'
	| 'vehicle'
	| 'deal';

const CRUD_SUCCESS_MESSAGES: Record<CrudEntity, Record<CrudAction, string>> = {
	lead: {
		created: 'Lead criado com sucesso.',
		updated: 'Lead atualizado com sucesso.',
		deleted: 'Lead excluído com sucesso.',
	},
	customer: {
		created: 'Cliente criado com sucesso.',
		updated: 'Cliente atualizado com sucesso.',
		deleted: 'Cliente excluído com sucesso.',
	},
	store: {
		created: 'Loja criada com sucesso.',
		updated: 'Loja atualizada com sucesso.',
		deleted: 'Loja excluída com sucesso.',
	},
	user: {
		created: 'Usuário criado com sucesso.',
		updated: 'Usuário atualizado com sucesso.',
		deleted: 'Usuário excluído com sucesso.',
	},
	accessGroup: {
		created: 'Grupo de acesso criado com sucesso.',
		updated: 'Grupo de acesso atualizado com sucesso.',
		deleted: 'Grupo de acesso excluído com sucesso.',
	},
	team: {
		created: 'Equipe criada com sucesso.',
		updated: 'Equipe atualizada com sucesso.',
		deleted: 'Equipe excluída com sucesso.',
	},
	vehicle: {
		created: 'Veículo criado com sucesso.',
		updated: 'Veículo atualizado com sucesso.',
		deleted: 'Veículo excluído com sucesso.',
	},
	deal: {
		created: 'Negociação criada com sucesso.',
		updated: 'Negociação atualizada com sucesso.',
		deleted: 'Negociação excluída com sucesso.',
	},
};

type ShowCrudSuccessToastOptions = {
	readonly message?: string;
	readonly id?: string;
};

function resolveCrudSuccessMessage(
	entity: CrudEntity,
	action: CrudAction,
): string {
	for (const [entityKey, messages] of Object.entries(CRUD_SUCCESS_MESSAGES)) {
		if (entityKey !== entity) {
			continue;
		}
		for (const [actionKey, message] of Object.entries(messages)) {
			if (actionKey === action) {
				return message;
			}
		}
	}
	return 'Operação concluída com sucesso.';
}

function showCrudSuccessToast(
	entity: CrudEntity,
	action: CrudAction,
	options?: ShowCrudSuccessToastOptions,
) {
	toast.success(
		options?.message ?? resolveCrudSuccessMessage(entity, action),
		{
			id: options?.id,
			...appToastStyle,
		},
	);
}

export {
	CRUD_SUCCESS_MESSAGES,
	showCrudSuccessToast,
	type CrudAction,
	type CrudEntity,
};
