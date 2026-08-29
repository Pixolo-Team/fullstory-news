// SERVICES //
import { AdminController } from '@/modules/admin/admin.controller.js';
import { AdminRepository } from '@/modules/admin/admin.repository.js';
import { AdminService } from '@/modules/admin/admin.service.js';
import { ArticlesModule } from '@/modules/articles/articles.module.js';
import { AuthModule } from '@/modules/auth/auth.module.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Admin module.
 */
@Module({
  imports: [ArticlesModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminRepository, AdminService],
})
export class AdminModule {}
