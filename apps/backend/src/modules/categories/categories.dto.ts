// LIBRARIES //
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Create-category request payload.
 */
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

/**
 * Update-category request payload.
 */
export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}
