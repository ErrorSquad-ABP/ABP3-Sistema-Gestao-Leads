'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import {
	accessGroupSchema,
	type AccessGroupFormValues,
} from '../schemas/user-management.schema';
import {
	roleLabels,
	roleOptions,
	type AccessFeatureKey,
	type AccessGroup,
	type UserRecord,
} from '../model/users.model';
import { getUsersErrorMessage } from './UserForm';

type AccessGroupDialogProps = {
	group: AccessGroup | null;
	isPending: boolean;
	mode: 'create' | 'edit';
	onClose: () => void;
	onSubmit: (values: AccessGroupFormValues) => Promise<void>;
	open: boolean;
};

type AccessFeatureOption = {
	key: AccessFeatureKey;
	label: string;
	description: string;
};

const accessFeatureCatalog: readonly AccessFeatureOption[] = [
	{
		key: 'dashboardOperational',
		label: 'Dashboard operacional',
		description: 'Indicadores diários, execução e acompanhamento do time.',
	},
	{
		key: 'dashboardAnalytic',
		label: 'Dashboard analítico',
		description: 'Leitura consolidada de desempenho e conversão.',
	},
	{
		key: 'leads',
		label: 'Leads',
		description: 'Fluxo comercial, priorização e acompanhamento de leads.',
	},
	{
		key: 'users',
		label: 'Usuários',
		description: 'CRUD administrativo de acessos e perfis.',
	},
	{
		key: 'profile',
		label: 'Perfil',
		description: 'Área de dados pessoais e apresentação do usuário.',
	},
	{
		key: 'credentials',
		label: 'Credenciais',
		description: 'Troca de senha e governança de acesso individual.',
	},
	{
		key: 'reports',
		label: 'Relatórios',
		description: 'Leitura consolidada e acompanhamento gerencial.',
	},
	{
		key: 'exports',
		label: 'Exportações',
		description: 'Saída de dados e downloads operacionais.',
	},
] as const;

function getFeatureLabels(featureKeys: readonly AccessFeatureKey[]) {
	return accessFeatureCatalog
		.filter((feature) => featureKeys.includes(feature.key))
		.map((feature) => feature.label);
}

function getBaseRoleLabel(role: AccessGroup['baseRole']) {
	if (!role) {
		return 'Grupo flexível';
	}

	switch (role) {
		case 'ADMINISTRATOR':
			return roleLabels.ADMINISTRATOR;
		case 'ATTENDANT':
			return roleLabels.ATTENDANT;
		case 'GENERAL_MANAGER':
			return roleLabels.GENERAL_MANAGER;
		case 'MANAGER':
			return roleLabels.MANAGER;
	}
}

function getRoleBadgeClassName(role: UserRecord['role']) {
	switch (role) {
		case 'ADMINISTRATOR':
			return 'border-[#d96c3f]/25 bg-[#d96c3f]/10 text-[#b3542c]';
		case 'GENERAL_MANAGER':
			return 'border-[#2d3648]/15 bg-[#2d3648]/8 text-[#2d3648]';
		case 'MANAGER':
			return 'border-sky-200 bg-sky-50 text-sky-800';
		case 'ATTENDANT':
			return 'border-emerald-200 bg-emerald-50 text-emerald-800';
	}
}

function AccessGroupDialog({
	group,
	isPending,
	mode,
	onClose,
	onSubmit,
	open,
}: AccessGroupDialogProps) {
	const isEditMode = mode === 'edit';
	const [submitError, setSubmitError] = useState<string | null>(null);
	const form = useForm<AccessGroupFormValues>({
		resolver: zodResolver(accessGroupSchema),
		defaultValues: {
			name: '',
			description: '',
			baseRole: null,
			featureKeys: ['profile'],
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset({
				name: '',
				description: '',
				baseRole: null,
				featureKeys: ['profile'],
			});
			setSubmitError(null);
			return;
		}

		if (group) {
			form.reset({
				name: group.name,
				description: group.description,
				baseRole: group.baseRole,
				featureKeys: group.featureKeys,
			});
		}
	}, [form, group, open]);

	const selectedFeatures = form.watch('featureKeys');

	function toggleFeature(featureKey: AccessFeatureKey, checked: boolean) {
		const current = form.getValues('featureKeys');
		form.setValue(
			'featureKeys',
			checked
				? Array.from(new Set([...current, featureKey]))
				: current.filter((item) => item !== featureKey),
			{ shouldDirty: true, shouldValidate: true },
		);
	}

	return (
		<Dialog onOpenChange={(nextOpen) => !nextOpen && onClose()} open={open}>
			<DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden p-0 sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>
						{isEditMode ? 'Editar grupo de acesso' : 'Novo grupo de acesso'}
					</DialogTitle>
					<DialogDescription>
						Defina o papel-base e as features que esse grupo libera na
						aplicação.
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex max-h-[calc(100vh-10rem)] flex-col"
					noValidate
					onSubmit={form.handleSubmit(async (values) => {
						setSubmitError(null);
						try {
							await onSubmit(values);
							onClose();
						} catch (error) {
							setSubmitError(getUsersErrorMessage(error));
						}
					})}
				>
					<div className="grid gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
						<div className="space-y-5">
							{submitError ? (
								<div className="flex items-start gap-2.5 rounded-md border border-[#f1c7c4] bg-[#fff7f7] px-3 py-2.5 text-[0.82rem] text-[#7a2f2a]">
									<AlertCircle className="mt-0.5 size-4 shrink-0 text-[#c65a52]" />
									<p className="leading-5">{submitError}</p>
								</div>
							) : null}

							<div className="space-y-1.5">
								<Label htmlFor="access-group-name">Nome do grupo</Label>
								<Input
									className="h-10 rounded-md border-[#d6dce5] shadow-none focus-visible:border-[#2d3648]/45"
									id="access-group-name"
									placeholder="Gerentes regionais"
									{...form.register('name')}
								/>
								{form.formState.errors.name ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.name.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="access-group-description">Descrição</Label>
								<textarea
									className="flex min-h-28 w-full rounded-md border border-[#d6dce5] bg-white px-3 py-2 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="access-group-description"
									placeholder="Explique quando esse grupo deve ser usado."
									{...form.register('description')}
								/>
								{form.formState.errors.description ? (
									<p className="text-xs text-destructive">
										{form.formState.errors.description.message}
									</p>
								) : null}
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="access-group-role">Papel canônico</Label>
								<select
									className="flex h-10 w-full rounded-md border border-[#d6dce5] bg-white px-3 text-sm text-[#1b2430] shadow-none outline-none transition-colors focus:border-[#2d3648]/45"
									id="access-group-role"
									onChange={(event) =>
										form.setValue(
											'baseRole',
											event.target.value === 'NONE'
												? null
												: (event.target
														.value as AccessGroupFormValues['baseRole']),
											{ shouldDirty: true, shouldValidate: true },
										)
									}
									value={form.watch('baseRole') ?? 'NONE'}
								>
									<option value="NONE">Sem vínculo canônico</option>
									{roleOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="space-y-4">
							<div className="rounded-2xl border border-border/80 bg-[#f8fafc] p-4">
								<p className="text-sm font-medium text-[#1b2430]">
									Feature toggles persistidos
								</p>
								<p className="mt-2 text-sm leading-6 text-[#6b7687]">
									O grupo é salvo na API e já governa navegação e gates do
									front.
								</p>
							</div>

							<div className="grid gap-3">
								{accessFeatureCatalog.map((feature) => {
									const checked = selectedFeatures.includes(feature.key);

									return (
										<label
											className={cn(
												'flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors',
												checked
													? 'border-[#d96c3f]/25 bg-[#d96c3f]/8'
													: 'border-border/80 bg-white hover:border-[#d96c3f]/20 hover:bg-[#fff9f6]',
											)}
											key={feature.key}
										>
											<Checkbox
												checked={checked}
												className="mt-0.5 rounded-[4px] border-[#cbd5e1] data-checked:border-[#D96C3F] data-checked:bg-[#D96C3F]"
												onCheckedChange={(value) =>
													toggleFeature(feature.key, value === true)
												}
											/>
											<div className="space-y-1">
												<p className="text-sm font-medium text-[#1b2430]">
													{feature.label}
												</p>
												<p className="text-sm leading-6 text-[#6b7687]">
													{feature.description}
												</p>
											</div>
										</label>
									);
								})}
							</div>

							{form.formState.errors.featureKeys ? (
								<p className="text-xs text-destructive">
									{form.formState.errors.featureKeys.message}
								</p>
							) : null}
						</div>
					</div>

					<DialogFooter>
						<Button
							className="rounded-md"
							onClick={onClose}
							type="button"
							variant="outline"
						>
							Cancelar
						</Button>
						<Button
							className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
							disabled={isPending}
							type="submit"
						>
							{isPending
								? isEditMode
									? 'Salvando...'
									: 'Criando...'
								: isEditMode
									? 'Salvar grupo'
									: 'Criar grupo'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export {
	AccessGroupDialog,
	getBaseRoleLabel,
	getFeatureLabels,
	getRoleBadgeClassName,
};
