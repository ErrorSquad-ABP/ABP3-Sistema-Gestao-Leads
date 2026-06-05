import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsOptional,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

class UpdateStoreValidator {
	@ApiPropertyOptional({
		example: 'Loja Centro',
	})
	@IsOptional()
	@IsString()
	@MinLength(1)
	name?: string;

	@ApiPropertyOptional({ example: 'Av. Andrômeda, 885', nullable: true })
	@IsOptional()
	@IsString()
	@MinLength(1)
	addressLine?: string | null;

	@ApiPropertyOptional({ example: 'São José dos Campos', nullable: true })
	@IsOptional()
	@IsString()
	@MinLength(1)
	city?: string | null;

	@ApiPropertyOptional({ example: 'SP', nullable: true })
	@IsOptional()
	@IsString()
	@Matches(/^[A-Z]{2}$/)
	state?: string | null;

	@ApiPropertyOptional({ example: 'São José dos Campos - SP', nullable: true })
	@IsOptional()
	@IsString()
	@MinLength(1)
	region?: string | null;

	@ApiPropertyOptional({ example: 'Sudeste', nullable: true })
	@IsOptional()
	@IsString()
	@MinLength(1)
	distributionRegion?: string | null;

	@ApiPropertyOptional({ example: 'SP', nullable: true })
	@IsOptional()
	@IsString()
	@MaxLength(80)
	@MinLength(1)
	coverage?: string | null;

	@ApiPropertyOptional({
		example: 'Abrangência: São José dos Campos, Jacareí e região.',
		nullable: true,
	})
	@IsOptional()
	@IsString()
	@MinLength(1)
	scope?: string | null;
}

export { UpdateStoreValidator };
