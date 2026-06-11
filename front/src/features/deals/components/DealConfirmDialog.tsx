'use client';

import { Trash2 } from 'lucide-react';

import { ModalFormErrorBanner } from '@/components/feedback/ModalFormErrorBanner';
import {
	AppModalBody,
	AppModalCancelButton,
	AppModalConfirmPanel,
	AppModalFooter,
	AppModalHeader,
	AppModalPrimaryButton,
	appModalContentClass,
} from '@/components/modals/AppModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type DealConfirmDialogProps = {
	confirmLabel: string;
	description: string;
	error: string | null;
	isPending: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	open: boolean;
	title: string;
};

function DealConfirmDialog({
	confirmLabel,
	description,
	error,
	isPending,
	onClose,
	onConfirm,
	open,
	title,
}: DealConfirmDialogProps) {
	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent className={`${appModalContentClass} max-w-xl`}>
				<AppModalHeader
					category="Negociações"
					description={description}
					icon={Trash2}
					title={title}
					tone="danger"
				/>
				<AppModalBody>
					<AppModalConfirmPanel icon={Trash2}>
						{description}
					</AppModalConfirmPanel>
					<ModalFormErrorBanner message={error} />
				</AppModalBody>
				<AppModalFooter>
					<AppModalCancelButton onClick={onClose} type="button">
						Cancelar
					</AppModalCancelButton>
					<AppModalPrimaryButton
						className="bg-red-600 hover:bg-red-700"
						disabled={isPending}
						onClick={() => void onConfirm()}
						type="button"
					>
						<Trash2 className="size-4" />
						{isPending ? 'Processando...' : confirmLabel}
					</AppModalPrimaryButton>
				</AppModalFooter>
			</DialogContent>
		</Dialog>
	);
}

export { DealConfirmDialog };
