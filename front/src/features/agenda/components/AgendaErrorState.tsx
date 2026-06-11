import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
	onRetry: () => void;
};

function AgendaErrorState({ onRetry }: Props) {
	return (
		<div
			className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-destructive/25 bg-destructive/5 p-8 text-center"
			role="alert"
		>
			<h2 className="text-base font-semibold text-destructive">
				Não foi possível carregar a agenda agora.
			</h2>
			<Button className="mt-4" onClick={onRetry} size="sm" variant="outline">
				<RefreshCw className="size-4" />
				Tentar novamente
			</Button>
		</div>
	);
}

export { AgendaErrorState };
