import Image from 'next/image';
import type { ReactNode } from 'react';

type LoginScreenLayoutProps = {
	children: ReactNode;
	headline: string;
	overlay?: ReactNode;
};

function LoginScreenLayout({
	children,
	headline,
	overlay,
}: LoginScreenLayoutProps) {
	return (
		<main className="relative h-screen bg-background">
			{overlay}

			<div className="flex h-screen w-full items-center p-6">
				<div className="grid h-[calc(100vh-3rem)] w-full overflow-hidden rounded-[1.5rem] bg-surface shadow-[0_30px_90px_-70px_var(--ring)] lg:grid-cols-2">
					<section className="relative hidden min-h-0 overflow-hidden lg:block">
						<video
							autoPlay
							className="absolute inset-0 h-full w-full object-cover"
							loop
							muted
							playsInline
						>
							<source src="/assets/login-wave.mp4" type="video/mp4" />
						</video>
						<div className="absolute inset-0 bg-foreground/35" />

						<div className="relative z-10 flex h-full flex-col px-9 py-8 text-white">
							<div className="flex items-center gap-3">
								<div className="relative size-11 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
									<Image
										alt="Quantum CRM"
										fill
										priority
										src="/assets/light-logo.png"
										className="object-cover"
									/>
								</div>
								<div className="leading-tight">
									<p className="text-[0.98rem] font-semibold tracking-tight">
										Quantum
									</p>
									<p className="text-[0.78rem] font-medium tracking-wide text-white/70">
										CRM
									</p>
								</div>
							</div>

							<div className="mt-auto max-w-[26rem] pb-8">
								<h2 className="mt-6 text-balance text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.04em]">
									{headline}
								</h2>

								<p className="mt-4 text-[0.95rem] leading-7 text-white/70">
									Mais organização, mais produtividade e mais vendas.
								</p>
							</div>
						</div>
					</section>

					<section className="flex min-h-0 items-center justify-center bg-background px-6 py-7 lg:bg-white">
						<div className="w-full max-w-[430px]">{children}</div>
					</section>
				</div>
			</div>
		</main>
	);
}

export { LoginScreenLayout };
