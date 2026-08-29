// LIBRARIES //
import { IsArray, IsEnum, IsIn, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

// TYPES //
import { ArticleSortData, ArticleStatusData } from '@/modules/articles/articles.types.js';

/**
 * Query string for article listings.
 */
export class GetArticlesDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(ArticleSortData)
  @IsOptional()
  sort?: ArticleSortData;

  @IsIn([ArticleStatusData.Draft, ArticleStatusData.Published, 'all'])
  @IsOptional()
  status?: ArticleStatusData | 'all';

  @IsString()
  @IsOptional()
  q?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

/**
 * Create-article request payload.
 */
export class CreateArticleDto {
  @IsString()
  headline!: string;

  @IsString()
  @IsOptional()
  subHeadline?: string | null;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUUID()
  categoryId!: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  heroImageUrl?: string | null;

  @IsString()
  @IsOptional()
  contentHtml?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

/**
 * Update-article request payload.
 */
export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  headline?: string;

  @IsString()
  @IsOptional()
  subHeadline?: string | null;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUrl({ require_tld: false, require_protocol: true })
  @IsOptional()
  heroImageUrl?: string | null;

  @IsString()
  @IsOptional()
  contentHtml?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(ArticleStatusData)
  @IsOptional()
  status?: ArticleStatusData;
}

/**
 * Ordered Instagram URL replacement payload.
 */
export class UpdateArticleInstagramDto {
  @IsArray()
  @IsUrl({ require_tld: false, require_protocol: true }, { each: true })
  urls!: string[];
}
