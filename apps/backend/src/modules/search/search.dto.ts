// LIBRARIES //
import { IsOptional, IsString } from 'class-validator';

/**
 * Search query string payload.
 */
export class SearchArticlesDto {
  @IsString()
  q!: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
