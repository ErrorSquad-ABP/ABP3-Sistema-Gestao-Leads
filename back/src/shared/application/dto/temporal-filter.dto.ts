import type { TemporalFilterMode } from '../../domain/enums/temporal-filter-mode.enum.js';

type PresetTemporalFilterMode = Exclude<TemporalFilterMode, 'custom'>;

type PresetTemporalFilterDto = {
	readonly period: PresetTemporalFilterMode;
	readonly referenceDate: string;
};

type CustomTemporalFilterDto = {
	readonly period: 'custom';
	readonly startDate: string;
	readonly endDate: string;
};

type TemporalFilterDto = PresetTemporalFilterDto | CustomTemporalFilterDto;

type ResolvedTemporalFilterDto = {
	readonly period: TemporalFilterMode;
	readonly startDate: string;
	readonly endDate: string;
	readonly referenceDate: string;
};

export type {
	CustomTemporalFilterDto,
	PresetTemporalFilterDto,
	PresetTemporalFilterMode,
	ResolvedTemporalFilterDto,
	TemporalFilterDto,
};
