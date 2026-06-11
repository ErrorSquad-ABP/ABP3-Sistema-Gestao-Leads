'use client';

import { Trash2 } from 'lucide-react';

import { ModalFormErrorBanner } from '@/components/feedback/ModalFormErrorBanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import {
	VehicleModalHeader,
	VehicleModalInfoBanner,
	VehicleModalSection,
	vehicleModalContentClass,
} from './VehicleModalLayout';

type VehicleConfirmDialogProps = {
	confirmLabel: string;
	description: string;
	error: string | null;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	open: boolean;
	title: string;
};

function VehicleConfirmDialog({
	confirmLabel,
	description,
	error,
	isPending,
	onClose,
	onConfirm,
	open,
	title,
}: VehicleConfirmDialogProps) {
	return (
		<Dialog onOpenChange={(next) => (!next ? onClose() : null)} open={open}>
			<DialogContent className={`${vehicleModalContentClass} max-w-xl`}>
				<VehicleModalHeader
					description={description}
					icon={Trash2}
					title={title}
				/>
				<div className="space-y-4 px-7 pt-3 pb-5">
					<VehicleModalInfoBanner>{description}</VehicleModalInfoBanner>
					<VehicleModalSection
						description="Confirme a ação para aplicar a alteração no catálogo."
						title="Confirmação"
					>
						<div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 px-4 py-4 text-sm text-[#6b7687]">
							<Trash2 className="mt-0.5 size-4 shrink-0 text-red-600" />
							<p>{description}</p>
						</div>
					</VehicleModalSection>
					<ModalFormErrorBanner message={error} />
				</div>
				<DialogFooter className="border-t-0 px-7 pt-1 pb-6">
					<Button
						className="rounded-lg"
						onClick={onClose}
						type="button"
						variant="outline"
					>
						Cancelar
					</Button>
					<Button
						className="rounded-lg bg-[#172033] hover:bg-[#111827]"
						disabled={isPending}
						onClick={() => void onConfirm()}
						type="button"
					>
						{isPending ? 'Processando...' : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { VehicleConfirmDialog };
