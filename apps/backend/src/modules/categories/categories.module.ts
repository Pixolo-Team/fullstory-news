// SERVICES //
import { AuthModule } from '@/modules/auth/auth.module.js';
import { CategoriesController } from '@/modules/categories/categories.controller.js';
import { CategoriesRepository } from '@/modules/categories/categories.repository.js';
import { CategoriesService } from '@/modules/categories/categories.service.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Categories module.
 */
@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesRepository, CategoriesService],
  exports: [CategoriesRepository, CategoriesService],
})
export class CategoriesModule {}
