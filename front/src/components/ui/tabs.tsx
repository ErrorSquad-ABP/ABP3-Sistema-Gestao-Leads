'use client';

import type * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Tabs({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			className={cn(
				'inline-flex h-11 items-center rounded-xl border border-border/80 bg-[#f8fafc] p-1 text-muted-foreground',
				className,
			)}
			data-slot="tabs-list"
			{...props}
		/>
	);
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			className={cn(
				'inline-flex min-w-40 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[#6b7687] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#d96c3f]/35 data-[state=active]:bg-white data-[state=active]:text-[#1b2430] data-[state=active]:shadow-sm',
				className,
			)}
			data-slot="tabs-trigger"
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			className={cn('mt-6 outline-none', className)}
			data-slot="tabs-content"
			{...props}
		/>
	);
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
