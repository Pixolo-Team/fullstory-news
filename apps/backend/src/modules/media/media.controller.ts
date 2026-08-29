// TYPES //
import type { Request, Response } from 'express';
import type { AppConfigData } from '@/config/app.config.js';
import type { UploadedFileData, UploadedImageData } from '@/modules/media/media.types.js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';

// CONSTANTS //
import { MAX_IMAGE_SIZE_BYTES } from '@/modules/media/media.constants.js';

// SERVICES //
import { AuthService } from '@/modules/auth/auth.service.js';
import { MediaService } from '@/modules/media/media.service.js';

// LIBRARIES //
import { Controller, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Media upload endpoints.
 */
@ApiTags('Media')
@Controller('upload')
export class MediaController {
  private readonly appConfig: AppConfigData;

  constructor(
    private readonly authService: AuthService,
    private readonly mediaService: MediaService,
    configService: ConfigService,
  ) {
    this.appConfig = buildAppConfig(configService);
  }

  /**
   * Uploads an article image.
   * @param request - Express request containing the session cookie
   * @param response - Express response used when tokens rotate
   * @param file - Uploaded image file
   * @returns Public URL for the uploaded file
   */
  @Post('image')
  // The limit is enforced here, not only in the service: without it multer
  // buffers the whole upload into memory before any size check can run.
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }))
  @ApiOperation({ summary: 'Upload an article image' })
  async uploadImage(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @UploadedFile() file?: UploadedFileData,
  ): Promise<UploadedImageData> {
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

    return this.mediaService.uploadImageService(file);
  }
}
