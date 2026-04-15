'use client';

import { ChevronLeft, ChevronRight, PencilLine, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import type { CustomerRecord } from '../model/customers.model';

type CustomersTableProps = {
	currentPage: number;
	customers: CustomerRecord[];
	onDelete: (customer: CustomerRecord) => void;
	onEdit: (customer: CustomerRecord) => void;
	onNextPage: () => void;
	onPreviousPage: () => void;
	totalItems: number;
	totalPages: number;
};

function CustomersTable({
	currentPage,
	customers,
	onDelete,
	onEdit,
	onNextPage,
	onPreviousPage,
	totalItems,
	totalPages,
}: CustomersTableProps) {
	return (
		<>
			<div className="overflow-hidden rounded-2xl border border-[#e6ecf3]">
				<Table>
					<TableHeader className="bg-[#f8fafc]">
						<TableRow className="border-[#e6ecf3]">
							<TableHead>Nome</TableHead>
							<TableHead>E-mail</TableHead>
							<TableHead>Telefone</TableHead>
							<TableHead>CPF</TableHead>
							<TableHead className="w-[140px] text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{customers.length === 0 ? (
							<TableRow className="border-[#e6ecf3]">
								<TableCell
									className="py-8 text-center text-sm text-muted-foreground"
									colSpan={5}
								>
									Nenhum cliente encontrado.
								</TableCell>
							</TableRow>
						) : (
							customers.map((customer) => (
								<TableRow
									key={customer.id}
									className="border-[#e6ecf3] odd:bg-[#f8fafc]/40"
								>
									<TableCell className="font-medium text-[#1b2430]">
										{customer.name}
									</TableCell>
									<TableCell>{customer.email ?? 'Sem e-mail'}</TableCell>
									<TableCell>{customer.phone ?? 'Sem telefone'}</TableCell>
									<TableCell>{customer.cpf ?? 'Sem CPF'}</TableCell>
									<TableCell>
										<div className="flex justify-end gap-2">
											<Button
												className="rounded-md shadow-none"
												onClick={() => onEdit(customer)}
												size="sm"
												variant="outline"
											>
												<PencilLine className="size-4" />
												Editar
											</Button>
											<Button
												className="rounded-md shadow-none"
												onClick={() => onDelete(customer)}
												size="sm"
												variant="destructive"
											>
												<Trash2 className="size-4" />
												Excluir
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex flex-col gap-3 border-t border-border/75 pt-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm text-[#6b7687]">{totalItems} clientes visíveis</p>
				<div className="flex items-center gap-2">
					<p className="mr-2 text-sm text-[#6b7687]">
						Página {currentPage} de {totalPages}
					</p>
					<Button
						className="rounded-md"
						disabled={currentPage <= 1}
						onClick={onPreviousPage}
						size="icon-sm"
						variant="outline"
					>
						<ChevronLeft className="size-4" />
					</Button>
					<Button
						className="rounded-md"
						disabled={currentPage >= totalPages}
						onClick={onNextPage}
						size="icon-sm"
						variant="outline"
					>
						<ChevronRight className="size-4" />
					</Button>
				</div>
			</div>
		</>
	);
}

export { CustomersTable };
