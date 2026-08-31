// TYPES //
import type { AdminCategoryData, CategoryData } from '@/modules/categories/categories.types.js';

// SERVICES //
import { CategoriesService } from '@/modules/categories/categories.service.js';

// LIBRARIES //
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/categories/categories.dto.js';

/**
 * Category endpoints for public and admin callers.
 */
@ApiTags('Categories')
@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Returns public categories.
   * @returns Categories used in public navigation
   */
  @Get('categories')
  @ApiOperation({ summary: 'List public categories' })
  @ApiOkResponse({ description: 'Category collection.' })
  async getCategories(): Promise<CategoryData[]> {
    return this.categoriesService.getCategoriesService();
  }

  /**
   * Returns a single category by slug.
   * @param slug - Category slug
   * @returns Matching category
   */
  @Get('categories/:slug')
  @ApiOperation({ summary: 'Get one category by slug' })
  async getCategoryBySlug(@Param('slug') slug: string): Promise<CategoryData> {
    return this.categoriesService.getCategoryBySlugService(slug);
  }

  /**
   * Returns admin category management data.
   * @returns Categories plus article counts
   */
  @Get('admin/categories')
  @ApiOperation({ summary: 'List categories for the admin panel' })
  async getAdminCategories(): Promise<AdminCategoryData[]> {
    return this.categoriesService.getAdminCategoriesService();
  }

  /**
   * Creates a category row.
   * @param body - Category payload
   * @returns Created category
   */
  @Post('categories')
  @ApiOperation({ summary: 'Create a category' })
  async createCategory(@Body() body: CreateCategoryDto): Promise<CategoryData> {
    return this.categoriesService.createCategoryService(body.name, body.slug);
  }

  /**
   * Updates a category row.
   * @param id - Category id
   * @param body - Partial update payload
   * @returns Updated category
   */
  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  async updateCategory(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
  ): Promise<CategoryData> {
    return this.categoriesService.updateCategoryService(id, body);
  }

  /**
   * Deletes a category row.
   * @param id - Category id
   * @returns Null payload on success
   */
  @Delete('categories/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a category' })
  async deleteCategory(@Param('id') id: string): Promise<null> {
    return this.categoriesService.deleteCategoryService(id);
  }
}
