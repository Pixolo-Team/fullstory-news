// SERVICES //
import { AuthController } from '@/modules/auth/auth.controller.js';
import { AuthRepository } from '@/modules/auth/auth.repository.js';
import { AuthService } from '@/modules/auth/auth.service.js';

// LIBRARIES //
import { Module } from '@nestjs/common';

/**
 * Auth module.
 */
@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
