// SERVICES //
import { AuthModule } from '@/modules/auth/auth.module.js';
import { MediaController } from '@/modules/media/media.controller.js';
import { MediaService } from '@/modules/media/media.service.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Media module.
 */
@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
