// TYPES //
import type { UploadedFileData, UploadedImageData } from '@/modules/media/media.types.js';

// CONSTANTS //
import { MAX_IMAGE_SIZE_BYTES } from '@/modules/media/media.constants.js';

// SERVICES //
import { MediaService } from '@/modules/media/media.service.js';

// LIBRARIES //
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Media upload endpoints.
 */
@ApiTags('Media')
@Controller('upload')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Uploads an article image.
   * @param file - Uploaded image file
   * @returns Public URL for the uploaded file
   */
  @Post('image')
  // The limit is enforced here, not only in the service: without it multer
  // buffers the whole upload into memory before any size check can run.
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }))
  @ApiOperation({ summary: 'Upload an article image' })
  async uploadImage(@UploadedFile() file?: UploadedFileData): Promise<UploadedImageData> {
    return this.mediaService.uploadImageService(file);
  }
}
