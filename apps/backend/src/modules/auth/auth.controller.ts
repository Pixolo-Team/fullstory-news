// TYPES //
import type { Request, Response } from 'express';
import type { AppConfigData } from '@/config/app.config.js';
import type { AuthorData } from '@/modules/auth/auth.types.js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';

// SERVICES //
import { AuthService } from '@/modules/auth/auth.service.js';

// LIBRARIES //
import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '@/modules/auth/auth.dto.js';

/**
 * Authentication endpoints for the admin panel.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly appConfig: AppConfigData;

  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    this.appConfig = buildAppConfig(configService);
  }

  /**
   * Creates an authenticated admin session.
   * @param body - Login credentials
   * @param response - Express response used to write the session cookie
   * @returns The authenticated author profile
   */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Create an admin session' })
  @ApiOkResponse({ description: 'Authenticated author profile.' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthorData> {
    const result = await this.authService.loginService(body.email, body.password);

    response.cookie(
      this.appConfig.sessionCookieName,
      this.authService.encodeSessionCookieService(result.sessionCookie as import('@/modules/auth/auth.types.js').SessionCookieData),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: this.appConfig.isProduction,
        maxAge: this.appConfig.sessionCookieMaxAgeMs,
        path: '/',
      },
    );

    return result.author;
  }

  /**
   * Clears the authenticated admin session.
   * @param response - Express response used to clear the session cookie
   * @returns Null payload with a success status
   */
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear the admin session' })
  async logout(@Res({ passthrough: true }) response: Response): Promise<null> {
    await this.authService.logoutService();
    response.clearCookie(this.appConfig.sessionCookieName, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.appConfig.isProduction,
      path: '/',
    });

    return null;
  }

  /**
   * Returns the currently authenticated author.
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @returns The current author profile
   */
  @Get('me')
  @ApiOperation({ summary: 'Get the current admin session author' })
  async getMe(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthorData> {
    const result = await this.authService.getCurrentAuthorService(
      request.headers.cookie,
      this.appConfig.sessionCookieName,
    );

    if (result.sessionCookie) {
      response.cookie(
        this.appConfig.sessionCookieName,
        this.authService.encodeSessionCookieService(result.sessionCookie),
        {
          httpOnly: true,
          sameSite: 'lax',
          secure: this.appConfig.isProduction,
          maxAge: this.appConfig.sessionCookieMaxAgeMs,
          path: '/',
        },
      );
    }

    return result.author;
  }
}
