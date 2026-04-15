'use client';

import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import type { StoreRecord } from '../types/stores.types';

type StoresTableProps = {
	canManageStores: boolean;
	onDelete: (store: StoreRecord) => void;
	onEdit: (store: StoreRecord) => void;
	stores: StoreRecord[];
};

function StoresTable({
	canManageStores,
	onDelete,
	onEdit,
	stores,
}: StoresTableProps) {
	return (
		<div className="overflow-hidden rounded-2xl border border-[#e6ecf3]">
			<Table>
				<TableHeader className="bg-[#f8fafc]">
					<TableRow className="border-[#e6ecf3]">
						<TableHead>Loja</TableHead>
						<TableHead className="w-[150px] text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{stores.map((store) => (
						<TableRow
							className="border-[#e6ecf3] odd:bg-[#f8fafc]/40"
							key={store.id}
						>
							<TableCell className="font-medium">{store.name}</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<Button
										className="rounded-md shadow-none"
										disabled={!canManageStores}
										onClick={() => onEdit(store)}
										size="sm"
										variant="outline"
									>
										Editar
									</Button>
									<Button
										className="rounded-md shadow-none"
										disabled={!canManageStores}
										onClick={() => onDelete(store)}
										size="sm"
										variant="destructive"
									>
										Excluir
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { StoresTable };
