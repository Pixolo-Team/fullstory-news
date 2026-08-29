// TYPES //
import type { Request, Response } from 'express';
import type { AppConfigData } from '@/config/app.config.js';
import type { AdminCategoryData, CategoryData } from '@/modules/categories/categories.types.js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';

// SERVICES //
import { AuthService } from '@/modules/auth/auth.service.js';
import { CategoriesService } from '@/modules/categories/categories.service.js';

// LIBRARIES //
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/categories/categories.dto.js';

/**
 * Category endpoints for public and admin callers.
 */
@ApiTags('Categories')
@Controller()
export class CategoriesController {
  private readonly appConfig: AppConfigData;

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.appConfig = buildAppConfig(configService);
  }

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
  async getAdminCategories(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminCategoryData[]> {
    await this.authenticateRequest(request, response);
    return this.categoriesService.getAdminCategoriesService();
  }

  /**
   * Creates a category row.
   * @param body - Category payload
   * @returns Created category
   */
  @Post('categories')
  @ApiOperation({ summary: 'Create a category' })
  async createCategory(
    @Body() body: CreateCategoryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CategoryData> {
    await this.authenticateRequest(request, response);
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
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<CategoryData> {
    await this.authenticateRequest(request, response);
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
  async deleteCategory(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<null> {
    await this.authenticateRequest(request, response);
    return this.categoriesService.deleteCategoryService(id);
  }

  /**
   * Resolves the current authenticated admin session.
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Resolves when the caller is authenticated
   */
  private async authenticateRequest(request: Request, response: Response): Promise<void> {
    const session = await this.authService.getCurrentAuthorService(
      request.headers.cookie,
      this.appConfig.sessionCookieName,
    );

    if (!session.sessionCookie) {
      return;
    }

    response.cookie(
      this.appConfig.sessionCookieName,
      this.authService.encodeSessionCookieService(session.sessionCookie),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: this.appConfig.isProduction,
        maxAge: this.appConfig.sessionCookieMaxAgeMs,
        path: '/',
      },
    );
  }
}
