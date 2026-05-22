type ConicSegment = {
	color: string;
	percentage: number;
};

/** Builds conic-gradient color stops; last segment ends at 100%. */
export function buildConicGradientStopsTo100(
	segments: ReadonlyArray<ConicSegment>,
): string {
	if (segments.length === 0) {
		return '#eef2f7 0% 100%';
	}

	let cursor = 0;
	const stops = segments.map((segment, index) => {
		const start = Math.min(cursor, 100);
		const end =
			index === segments.length - 1
				? 100
				: Math.min(cursor + segment.percentage, 100);
		cursor = end;
		return `${segment.color} ${start}% ${end}%`;
	});

	return stops.join(', ');
}

/** Builds conic-gradient stops by accumulating segment percentages. */
export function buildConicGradientStopsAccumulating(
	segments: ReadonlyArray<ConicSegment>,
): string {
	if (segments.length === 0) {
		return '#eef2f7 0% 100%';
	}

	let cursor = 0;
	const stops = segments.map((segment) => {
		const start = cursor;
		cursor += segment.percentage;
		return `${segment.color} ${start}% ${Math.max(cursor, start + 1)}%`;
	});

	return stops.join(',');
}
