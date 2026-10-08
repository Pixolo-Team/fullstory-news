// TYPES //
import type { AuthorPageData, AuthorProfileData } from '@/modules/authors/authors.types.js';
import type { AuthorRowData } from '@/modules/authors/authors.repository.js';

// CONSTANTS //
import { AUTHOR_STORIES_LIMIT } from '@/common/constants/pagination.constants.js';

// SERVICES //
import { ArticlesRepository } from '@/modules/articles/articles.repository.js';
import { AuthorsRepository } from '@/modules/authors/authors.repository.js';

// UTILS //
import { DependencyError, NotFoundError } from '@/common/errors/domain.error.js';
import { toSlugUtil } from '@/common/utils/slug.util.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';

/**
 * Author profile business logic.
 */
@Injectable()
export class AuthorsService {
  constructor(
    private readonly authorsRepository: AuthorsRepository,
    private readonly articlesRepository: ArticlesRepository,
  ) {}

  /**
   * Lists every author as a public profile
   * @returns Author profiles in name order
   */
  async getAuthorsService(): Promise<AuthorProfileData[]> {
    try {
      const authors = await this.authorsRepository.findAuthorsRepository();
      return authors.map((author) => this.mapAuthorProfile(author));
    } catch {
      throw new DependencyError('Failed to load authors');
    }
  }

  /**
   * Resolves one author's profile and published Stories from a byline slug
   * @param slug - Slug derived from the author's name
   * @returns The author profile plus their published Stories
   * @throws NotFoundError when no author's name maps to the slug
   */
  async getAuthorBySlugService(slug: string): Promise<AuthorPageData> {
    const authors = await this.authorsRepository.findAuthorsRepository();
    const match = authors.find((author) => toSlugUtil(author.name) === slug);

    if (!match) {
      throw new NotFoundError('Author', slug);
    }

    try {
      const stories = await this.articlesRepository.findArticlesByAuthorIdRepository(
        match.id,
        AUTHOR_STORIES_LIMIT,
      );

      return { author: this.mapAuthorProfile(match), stories };
    } catch {
      throw new DependencyError("Failed to load the author's Stories");
    }
  }

  /**
   * Maps a raw author row to its public profile shape
   * @param row - Raw author row
   * @returns Public author profile
   */
  private mapAuthorProfile(row: AuthorRowData): AuthorProfileData {
    return {
      id: row.id,
      slug: toSlugUtil(row.name),
      name: row.name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
    };
  }
}
