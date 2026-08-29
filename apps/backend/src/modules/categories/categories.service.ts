// TYPES //
import type { AdminCategoryData, CategoryData } from '@/modules/categories/categories.types.js';

// SERVICES //
import { CategoriesRepository } from '@/modules/categories/categories.repository.js';

// UTILS //
import { ConflictError, DependencyError, NotFoundError } from '@/common/errors/domain.error.js';
import { toSlugUtil } from '@/common/utils/slug.util.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';

/**
 * Category business logic.
 */
@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  /**
   * Returns public category data.
   * @returns Categories for the public site
   */
  async getCategoriesService(): Promise<CategoryData[]> {
    try {
      return await this.categoriesRepository.findCategoriesRepository();
    } catch {
      throw new DependencyError('Failed to load categories');
    }
  }

  /**
   * Returns a single public category.
   * @param slug - Category slug
   * @returns The matching category
   */
  async getCategoryBySlugService(slug: string): Promise<CategoryData> {
    try {
      const category = await this.categoriesRepository.findCategoryBySlugRepository(slug);
      if (!category) {
        throw new NotFoundError('Category', slug);
      }
      return category;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DependencyError('Failed to load the category');
    }
  }

  /**
   * Returns admin category data including article counts.
   * @returns Categories for the admin panel
   */
  async getAdminCategoriesService(): Promise<AdminCategoryData[]> {
    try {
      return await this.categoriesRepository.findAdminCategoriesRepository();
    } catch {
      throw new DependencyError('Failed to load admin categories');
    }
  }

  /**
   * Creates a category.
   * @param name - Category display name
   * @param slug - Optional user-supplied slug
   * @returns The created category
   */
  async createCategoryService(name: string, slug?: string): Promise<CategoryData> {
    const resolvedSlug = toSlugUtil(slug ?? name);

    try {
      return await this.categoriesRepository.createCategoryRepository({
        name: name.trim(),
        slug: resolvedSlug,
      });
    } catch (error) {
      throw this.mapCategoryWriteError(error, 'Failed to create the category');
    }
  }

  /**
   * Updates a category.
   * @param id - Category id
   * @param payload - Partial fields to update
   * @returns The updated category
   */
  async updateCategoryService(id: string, payload: { name?: string; slug?: string }): Promise<CategoryData> {
    const resolvedPayload = {
      name: payload.name?.trim(),
      slug: payload.slug ? toSlugUtil(payload.slug) : undefined,
    };

    try {
      const category = await this.categoriesRepository.updateCategoryRepository(id, resolvedPayload);

      if (!category) {
        throw new NotFoundError('Category', id);
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw this.mapCategoryWriteError(error, 'Failed to update the category');
    }
  }

  /**
   * Deletes a category when it is no longer referenced by any article.
   * @param id - Category id
   * @returns Null on success
   */
  async deleteCategoryService(id: string): Promise<null> {
    try {
      const articleCount = await this.categoriesRepository.countArticlesByCategoryRepository(id);

      if (articleCount > 0) {
        throw new ConflictError(`Category has ${articleCount} articles`);
      }

      const deleted = await this.categoriesRepository.deleteCategoryRepository(id);

      if (!deleted) {
        throw new NotFoundError('Category', id);
      }

      return null;
    } catch (error) {
      if (error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }

      throw new DependencyError('Failed to delete the category');
    }
  }

  /**
   * Maps storage-layer category write failures to client-safe errors.
   * @param error - Unknown repository error
   * @param fallbackMessage - Message used when the failure is not a conflict
   * @returns A domain error to throw
   */
  private mapCategoryWriteError(error: unknown, fallbackMessage: string): ConflictError | DependencyError {
    if (error instanceof Error && /duplicate key value/i.test(error.message)) {
      return new ConflictError('Category name or slug already exists');
    }

    return new DependencyError(fallbackMessage);
  }
}
