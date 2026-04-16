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

import type { TeamRecord } from '../model/teams.model';

type TeamsTableProps = {
	onDelete: (team: TeamRecord) => void;
	onEdit: (team: TeamRecord) => void;
	ownerLabelById: Record<string, string>;
	storeLabelById: Record<string, string>;
	teams: TeamRecord[];
};

function TeamsTable({
	onDelete,
	onEdit,
	ownerLabelById,
	storeLabelById,
	teams,
}: TeamsTableProps) {
	return (
		<div className="overflow-hidden rounded-2xl border border-[#e6ecf3]">
			<Table>
				<TableHeader className="bg-[#f8fafc]">
					<TableRow className="border-[#e6ecf3]">
						<TableHead>Equipe</TableHead>
						<TableHead>Loja</TableHead>
						<TableHead>Gerente</TableHead>
						<TableHead>Membros</TableHead>
						<TableHead className="w-[150px] text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{teams.map((team) => (
						<TableRow
							className="border-[#e6ecf3] odd:bg-[#f8fafc]/40"
							key={team.id}
						>
							<TableCell className="font-medium">{team.name}</TableCell>
							<TableCell>
								{storeLabelById[team.storeId] ?? 'Loja vinculada'}
							</TableCell>
							<TableCell>
								{team.managerId
									? (ownerLabelById[team.managerId] ?? 'Gerente definido')
									: 'Sem gerente'}
							</TableCell>
							<TableCell>{team.memberUserIds.length}</TableCell>
							<TableCell>
								<div className="flex justify-end gap-2">
									<Button
										className="rounded-md shadow-none"
										onClick={() => onEdit(team)}
										size="sm"
										variant="outline"
									>
										Editar
									</Button>
									<Button
										className="rounded-md shadow-none"
										onClick={() => onDelete(team)}
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

export { TeamsTable };
