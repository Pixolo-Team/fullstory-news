import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';

/*
 * Feature modules are added here as they are built. The planned surface is
 * documented in docs/api.md:
 *   AuthModule, CategoriesModule, StoriesModule, SearchModule,
 *   StaticPagesModule, MediaModule
 *
 * Nothing beyond health is implemented yet — this is repository setup.
 */
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController],
})
export class AppModule {}
