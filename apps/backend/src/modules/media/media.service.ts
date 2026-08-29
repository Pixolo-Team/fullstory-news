// TYPES //
import type { UploadedFileData, UploadedImageData } from '@/modules/media/media.types.js';
import type { SupabaseClient } from '@supabase/supabase-js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// CONSTANTS //
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXTENSIONS,
  IMAGE_MAGIC_BYTES,
  MAX_IMAGE_SIZE_BYTES,
} from '@/modules/media/media.constants.js';

// UTILS //
import { DependencyError, ValidationError } from '@/common/errors/domain.error.js';

// LIBRARIES //
import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Image upload business logic.
 */
@Injectable()
export class MediaService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Uploads an image to Supabase Storage.
   * @param file - Uploaded image file
   * @returns Public URL for the stored file
   */
  async uploadImageService(file: UploadedFileData | undefined): Promise<UploadedImageData> {
    if (!file) {
      throw new ValidationError('Image file is required');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new ValidationError('Image exceeds the 5 MB limit');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new ValidationError('Unsupported image type');
    }

    // mimetype is whatever the client put in the multipart header, so the
    // bytes are checked too. Without this an HTML or SVG payload declaring
    // image/png would be stored and served from a public bucket.
    if (!this.hasMatchingSignatureService(file)) {
      throw new ValidationError('File contents do not match the declared image type');
    }

    const appConfig = buildAppConfig(this.configService);

    // The stored name is generated, never taken from originalname: the client
    // controls that string, and it decides both the storage path and the
    // extension the bucket serves the object as.
    const extension = IMAGE_EXTENSIONS[file.mimetype] ?? 'bin';
    const path = `articles/${Date.now()}-${randomUUID()}.${extension}`;

    const uploadResult = await this.supabase.storage
      .from(appConfig.storageBucket)
      .upload(path, file.buffer, {
        cacheControl: '3600',
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadResult.error) {
      throw new DependencyError('Failed to upload the image');
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(appConfig.storageBucket).getPublicUrl(path);

    return { url: publicUrl };
  }

  /**
   * Checks an upload's leading bytes against its declared type.
   * @param file - Uploaded image file
   * @returns True when the contents match the declared mimetype
   */
  private hasMatchingSignatureService(file: UploadedFileData): boolean {
    const signatures = IMAGE_MAGIC_BYTES[file.mimetype];

    if (!signatures) {
      return false;
    }

    const matchesPrefix = signatures.some((signature) =>
      signature.every((byte, index) => file.buffer[index] === byte),
    );

    if (!matchesPrefix) {
      return false;
    }

    // RIFF alone also covers WAV and AVI, so a WebP must carry the WEBP tag.
    if (file.mimetype === 'image/webp') {
      return file.buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    }

    return true;
  }
}
