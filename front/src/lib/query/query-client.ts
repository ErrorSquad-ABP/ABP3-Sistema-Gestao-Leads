type QueryKey = readonly [string, ...unknown[]];

function createQueryKey(
	segment: string,
	...segments: readonly unknown[]
): QueryKey {
	return [segment, ...segments];
}

export type { QueryKey };
export { createQueryKey };
