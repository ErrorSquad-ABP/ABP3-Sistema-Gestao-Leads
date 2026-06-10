import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

class CreateStoreValidator {
	@ApiProperty({
		example: 'Loja Centro',
	})
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsOptional()
	@IsString()
	@MinLength(1)
	addressLine?: string | null;

	@IsOptional()
	@IsString()
	@MinLength(1)
	city?: string | null;

	@IsOptional()
	@IsString()
	@Matches(/^[A-Z]{2}$/)
	state?: string | null;

	@IsOptional()
	@IsString()
	@MinLength(1)
	region?: string | null;

	@IsOptional()
	@IsString()
	@MinLength(1)
	distributionRegion?: string | null;

	@IsOptional()
	@IsString()
	@MaxLength(80)
	@MinLength(1)
	coverage?: string | null;

	@IsOptional()
	@IsString()
	@MinLength(1)
	scope?: string | null;
}

export { CreateStoreValidator };
