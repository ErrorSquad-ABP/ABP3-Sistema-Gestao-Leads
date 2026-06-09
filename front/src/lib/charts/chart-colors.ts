const CHART_COLORS = {
	barAlt: "var(--chart-bar-alt)",
	barDefault: "var(--chart-bar-default)",
	cold: "var(--chart-cold)",
	hot: "var(--chart-hot)",
	neutral: "var(--chart-neutral)",
	performanceBelow: "var(--chart-performance-below)",
	performanceOk: "var(--chart-performance-ok)",
	warm: "var(--chart-warm)",
} as const

const SOURCE_BRAND_COLORS = {
	facebook: "var(--chart-source-facebook)",
	instagram: "var(--chart-source-instagram)",
	mercadoLivre: "var(--chart-source-mercado-livre)",
	phone: "var(--chart-source-phone)",
	store: "var(--chart-source-store)",
	indication: "var(--chart-source-indication)",
	website: "var(--chart-source-website)",
	whatsapp: "var(--chart-source-whatsapp)",
} as const

const SERIES_COLORS = [
	CHART_COLORS.barDefault,
	CHART_COLORS.barAlt,
	CHART_COLORS.neutral,
	CHART_COLORS.performanceOk,
	CHART_COLORS.cold,
] as const

const DEFAULT_STORE_PERFORMANCE_THRESHOLD = 0.25
const FALLBACK_SOURCE_COLOR = CHART_COLORS.neutral
const MAX_SHARE = 1
const MIN_SERIES_INDEX = 0
const MIN_SHARE = 0

const SOURCE_COLOR_ALIASES = new Map<string, string>([
	["contato-telefonico", SOURCE_BRAND_COLORS.phone],
	["digital-form", SOURCE_BRAND_COLORS.website],
	["facebook", SOURCE_BRAND_COLORS.facebook],
	["form", SOURCE_BRAND_COLORS.website],
	["formulario-digital", SOURCE_BRAND_COLORS.website],
	["indicacao", SOURCE_BRAND_COLORS.indication],
	["indication", SOURCE_BRAND_COLORS.indication],
	["instagram", SOURCE_BRAND_COLORS.instagram],
	["mercado-libre", SOURCE_BRAND_COLORS.mercadoLivre],
	["mercado-livre", SOURCE_BRAND_COLORS.mercadoLivre],
	["phone", SOURCE_BRAND_COLORS.phone],
	["phone-call", SOURCE_BRAND_COLORS.phone],
	["site", SOURCE_BRAND_COLORS.website],
	["store", SOURCE_BRAND_COLORS.store],
	["store-visit", SOURCE_BRAND_COLORS.store],
	["telefone", SOURCE_BRAND_COLORS.phone],
	["visita-em-loja", SOURCE_BRAND_COLORS.store],
	["walk-in", SOURCE_BRAND_COLORS.store],
	["website", SOURCE_BRAND_COLORS.website],
	["whatsapp", SOURCE_BRAND_COLORS.whatsapp],
])

function normalizeChartKey(value: unknown): string {
	if (typeof value !== "string" && typeof value !== "number") {
		return ""
	}

	return String(value)
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[\s_]+/g, "-")
		.toLowerCase()
}

function sanitizeShare(value: number): number {
	if (!Number.isFinite(value)) {
		return MIN_SHARE
	}

	return Math.min(MAX_SHARE, Math.max(MIN_SHARE, value))
}

function sanitizeThreshold(value: number): number {
	if (!Number.isFinite(value)) {
		return DEFAULT_STORE_PERFORMANCE_THRESHOLD
	}

	return sanitizeShare(value)
}

function sourceBrandColor(source: unknown): string {
	return (
		SOURCE_COLOR_ALIASES.get(normalizeChartKey(source)) ?? FALLBACK_SOURCE_COLOR
	)
}

function storePerformanceColor(
	share: number,
	threshold = DEFAULT_STORE_PERFORMANCE_THRESHOLD
): string {
	const safeShare = sanitizeShare(share)
	const safeThreshold = sanitizeThreshold(threshold)

	return safeShare < safeThreshold
		? CHART_COLORS.performanceBelow
		: CHART_COLORS.performanceOk
}

function statusBarColor(): string {
	return CHART_COLORS.barDefault
}

function chartSeriesColor(index: number): string {
	const safeIndex = Number.isFinite(index)
		? Math.max(MIN_SERIES_INDEX, Math.trunc(index))
		: MIN_SERIES_INDEX
	return SERIES_COLORS[safeIndex % SERIES_COLORS.length]
}

export {
	CHART_COLORS,
	SOURCE_BRAND_COLORS,
	chartSeriesColor,
	sourceBrandColor,
	statusBarColor,
	storePerformanceColor,
}
