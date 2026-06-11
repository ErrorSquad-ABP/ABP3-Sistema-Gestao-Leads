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

type AgendaConfirmDeleteDialogProps = {
	error: string | null;
	isPending: boolean;
	itemTitle: string;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	open: boolean;
};

function AgendaConfirmDeleteDialog({
	error,
	isPending,
	itemTitle,
	onClose,
	onConfirm,
	open,
}: AgendaConfirmDeleteDialogProps) {
	const description = `O agendamento "${itemTitle}" será removido permanentemente da agenda.`;

	return (
		<Dialog
			onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}
			open={open}
		>
			<DialogContent className={`${appModalContentClass} max-w-xl`}>
				<AppModalHeader
					category="Agenda"
					description={description}
					icon={Trash2}
					title="Excluir agendamento"
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
						{isPending ? 'Excluindo...' : 'Excluir'}
					</AppModalPrimaryButton>
				</AppModalFooter>
			</DialogContent>
		</Dialog>
	);
}

export { AgendaConfirmDeleteDialog };
