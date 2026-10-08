// SERVICES //
import { ArticlesModule } from '@/modules/articles/articles.module.js';
import { AuthorsController } from '@/modules/authors/authors.controller.js';
import { AuthorsRepository } from '@/modules/authors/authors.repository.js';
import { AuthorsService } from '@/modules/authors/authors.service.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Authors module.
 */
@Module({
  imports: [ArticlesModule],
  controllers: [AuthorsController],
  providers: [AuthorsRepository, AuthorsService],
  exports: [AuthorsRepository, AuthorsService],
})
export class AuthorsModule {}
