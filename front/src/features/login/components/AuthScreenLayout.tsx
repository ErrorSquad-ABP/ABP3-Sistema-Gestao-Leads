import type { ReactNode } from 'react';

type AuthScreenLayoutProps = {
	asideTitle: string;
	children: ReactNode;
	contentClassName?: string;
	overlay?: ReactNode;
	subtitle: string;
	title: string;
};

function AuthScreenLayout({
	asideTitle,
	children,
	contentClassName,
	overlay,
	subtitle,
	title,
}: AuthScreenLayoutProps) {
	return (
		<main className="relative min-h-screen bg-[#F4F6F8]">
			{overlay}

			<div className="grid min-h-screen lg:grid-cols-[34.5%_65.5%]">
				<section className="relative hidden min-h-screen overflow-hidden bg-[#1b2430] lg:flex">
					<video
						autoPlay
						className="absolute inset-0 h-full w-full object-cover"
						loop
						muted
						playsInline
					>
						<source src="/assets/login-wave.mp4" type="video/mp4" />
					</video>
					<div className="absolute inset-0 bg-[linear-gradient(200deg,rgba(27,36,48,0.24)_0%,rgba(45,54,72,0.74)_58%,rgba(217,108,63,0.34)_100%)]" />
					<div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 py-8 text-center text-white md:px-12">
						<div className="mb-5 flex h-[2.85rem] w-[2.85rem] items-center justify-center rounded-full border border-[#D96C3F]/45 bg-white text-[1.26rem] font-semibold tracking-tight text-[#2d3648] shadow-[0_0_0_4px_rgba(217,108,63,0.08)]">
							lc
						</div>
						<h2 className="max-w-[18rem] text-[2.25rem] font-normal leading-[1.04] tracking-[-0.04em] md:text-[2.48rem]">
							{asideTitle}
						</h2>
					</div>
				</section>

				<section className="flex min-h-screen items-center justify-center border-l border-[#D6DCE5] bg-[#FFFFFF] p-7 md:p-11">
					<div className="flex w-full max-w-102 flex-col items-center gap-4.5">
						<div className="flex w-full max-w-102 flex-col items-center gap-4.5 text-center">
							<div className="flex h-[2.85rem] w-[2.85rem] items-center justify-center rounded-full border border-[#D96C3F]/20 bg-[#2d3648] text-[1.16rem] font-semibold tracking-tight text-[#fff7f3] shadow-[0_0_0_4px_rgba(217,108,63,0.08)]">
								lc
							</div>
							<div className="space-y-2">
								<h1 className="text-balance text-[1.9rem] font-normal tracking-[-0.04em] text-[#1b2430] sm:text-[2.15rem]">
									{title}
								</h1>
								<p className="text-[0.84rem] text-[#D96C3F]">{subtitle}</p>
							</div>
						</div>

						<div className={contentClassName ?? 'w-full max-w-92'}>
							{children}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}

export { AuthScreenLayout };
