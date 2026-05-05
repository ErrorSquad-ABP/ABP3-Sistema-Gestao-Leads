'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

type AuthAccentLinkProps = {
	children: ReactNode;
	className?: string;
	href: string;
};

function AuthAccentLink({ children, className, href }: AuthAccentLinkProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Link
			className={cn('cursor-pointer', className)}
			href={href}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				color: 'var(--brand-accent)',
				textDecorationColor: 'var(--brand-accent)',
				textDecorationLine: isHovered ? 'underline' : 'none',
				textUnderlineOffset: '4px',
			}}
		>
			{children}
		</Link>
	);
}

export { AuthAccentLink };
