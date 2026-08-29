// TYPES //
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminCategoryData, CategoryData } from '@/modules/categories/categories.types.js';

// CONFIG //
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// LIBRARIES //
import { Inject, Injectable } from '@nestjs/common';

/** Raw row shape from the categories table. */
interface CategoryRowData {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data access for categories.
 */
@Injectable()
export class CategoriesRepository {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  /**
   * Reads every category.
   * @returns Categories in name order
   */
  async findCategoriesRepository(): Promise<CategoryData[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true })
      .returns<CategoryData[]>();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  }

  /**
   * Finds a single category by slug.
   * @param slug - Category slug
   * @returns The matching category when found
   */
  async findCategoryBySlugRepository(slug: string): Promise<CategoryData | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', slug)
      .maybeSingle<CategoryData>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Reads categories for admin management including timestamps and counts.
   * @returns Categories with article counts
   */
  async findAdminCategoriesRepository(): Promise<AdminCategoryData[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id, name, slug, created_at, updated_at')
      .order('name', { ascending: true })
      .returns<CategoryRowData[]>();

    if (error) {
      throw new Error(error.message);
    }

    const categories = data ?? [];

    return Promise.all(
      categories.map(async (category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        articleCount: await this.countArticlesByCategoryRepository(category.id),
        createdAt: category.created_at,
        updatedAt: category.updated_at,
      })),
    );
  }

  /**
   * Creates a category row.
   * @param payload - Category fields to store
   * @returns The created category
   */
  async createCategoryRepository(payload: { name: string; slug: string }): Promise<CategoryData> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert(payload)
      .select('id, name, slug')
      .single<CategoryData>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Updates a category row.
   * @param id - Category id
   * @param payload - Partial fields to update
   * @returns The updated category when present
   */
  async updateCategoryRepository(
    id: string,
    payload: { name?: string; slug?: string },
  ): Promise<CategoryData | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select('id, name, slug')
      .maybeSingle<CategoryData>();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Deletes a category row.
   * @param id - Category id
   * @returns True when a row was deleted
   */
  async deleteCategoryRepository(id: string): Promise<boolean> {
    const { error, count } = await this.supabase
      .from('categories')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return (count ?? 0) > 0;
  }

  /**
   * Counts how many articles currently reference a category.
   * @param categoryId - Category id
   * @returns The article count for that category
   */
  async countArticlesByCategoryRepository(categoryId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }
}
