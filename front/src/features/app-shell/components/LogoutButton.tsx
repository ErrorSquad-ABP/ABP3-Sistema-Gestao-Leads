'use client';

import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle, LogOut } from 'lucide-react';
import { startTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { logout } from '@/features/login/api/login.service';
import { queryKeys } from '@/lib/constants/query-keys';
import { appRoutes } from '@/lib/routes/app-routes';

function LogoutButton() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [isPending, setIsPending] = useState(false);

	async function handleLogout() {
		if (isPending) {
			return;
		}

		setIsPending(true);

		try {
			await logout();
			await queryClient.cancelQueries({ queryKey: queryKeys.auth.currentUser });
			queryClient.setQueryData(queryKeys.auth.currentUser, null);
			startTransition(() => {
				router.replace(appRoutes.auth.login);
				router.refresh();
			});
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Button
			className="h-10 rounded-xl border border-white/70 bg-white/90 px-4 text-[#1B2430] shadow-none hover:bg-white"
			disabled={isPending}
			onClick={handleLogout}
			type="button"
			variant="secondary"
		>
			{isPending ? (
				<>
					<LoaderCircle className="size-4 animate-spin" />
					Saindo...
				</>
			) : (
				<>
					<LogOut className="size-4" />
					Sair
				</>
			)}
		</Button>
	);
}

export { LogoutButton };
