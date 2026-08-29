// TYPES //
import type { Request, Response } from 'express';
import type { AppConfigData } from '@/config/app.config.js';
import type { AdminStatsData } from '@/modules/admin/admin.types.js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';

// SERVICES //
import { AdminService } from '@/modules/admin/admin.service.js';
import { AuthService } from '@/modules/auth/auth.service.js';

// LIBRARIES //
import { Controller, Get, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * Admin-only dashboard endpoints.
 */
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  private readonly appConfig: AppConfigData;

  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.appConfig = buildAppConfig(configService);
  }

  /**
   * Returns dashboard summary counts.
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns Dashboard summary payload
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getStats(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AdminStatsData> {
    const session = await this.authService.getCurrentAuthorService(
      request.headers.cookie,
      this.appConfig.sessionCookieName,
    );

    if (session.sessionCookie) {
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

    return this.adminService.getStatsService();
  }
}
