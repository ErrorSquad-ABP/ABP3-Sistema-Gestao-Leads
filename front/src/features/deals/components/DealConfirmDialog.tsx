'use client';

import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

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
		<Dialog onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)} open={open}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 px-6 py-5">
					<div className="flex items-start gap-3 rounded-xl border border-border/75 bg-[#f8fafc] px-4 py-4 text-sm text-[#6b7687]">
						<Trash2 className="mt-0.5 size-4 text-destructive" />
						<p>{description}</p>
					</div>
					{error ? (
						<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</div>
					) : null}
				</div>
				<DialogFooter>
					<Button className="rounded-md" onClick={onClose} type="button" variant="outline">
						Cancelar
					</Button>
					<Button
						className="rounded-md bg-[#2D3648] hover:bg-[#232B3B]"
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

export { DealConfirmDialog };

