// TYPES //
import type { AuthorPageData, AuthorProfileData } from '@/modules/authors/authors.types.js';

// SERVICES //
import { AuthorsService } from '@/modules/authors/authors.service.js';

// LIBRARIES //
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Public author byline endpoints.
 */
@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  /**
   * Returns every author profile.
   * @returns Author profiles used by the sitemap and byline links
   */
  @Get()
  @ApiOperation({ summary: 'List author profiles' })
  @ApiOkResponse({ description: 'Author profile collection.' })
  async getAuthors(): Promise<AuthorProfileData[]> {
    return this.authorsService.getAuthorsService();
  }

  /**
   * Returns one author profile and their published Stories.
   * @param slug - Slug derived from the author's name
   * @returns Author profile with their Story archive
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Get one author profile by slug' })
  async getAuthorBySlug(@Param('slug') slug: string): Promise<AuthorPageData> {
    return this.authorsService.getAuthorBySlugService(slug);
  }
}
