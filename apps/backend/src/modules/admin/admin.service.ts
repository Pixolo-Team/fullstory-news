// TYPES //
import type { AdminStatsData } from '@/modules/admin/admin.types.js';

// SERVICES //
import { AdminRepository } from '@/modules/admin/admin.repository.js';
import { ArticlesService } from '@/modules/articles/articles.service.js';

// UTILS //
import { DependencyError } from '@/common/errors/domain.error.js';

// LIBRARIES //
import { Injectable } from '@nestjs/common';

/**
 * Dashboard summary logic.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly articlesService: ArticlesService,
  ) {}

  /**
   * Returns the dashboard summary payload.
   * @returns Aggregate counts for the admin home page
   */
  async getStatsService(): Promise<AdminStatsData> {
    try {
      const [articleStats, totalCategories] = await Promise.all([
        this.articlesService.getArticleStatsService(),
        this.adminRepository.countCategoriesRepository(),
      ]);

      return {
        ...articleStats,
        totalCategories,
      };
    } catch {
      throw new DependencyError('Failed to load dashboard statistics');
    }
  }
}
