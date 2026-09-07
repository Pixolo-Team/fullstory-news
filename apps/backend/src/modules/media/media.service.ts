// TYPES //
import type { UploadedFileData, UploadedImageData } from '@/modules/media/media.types.js';
import type { SupabaseClient } from '@supabase/supabase-js';

// CONFIG //
import { buildAppConfig } from '@/config/app.config.js';
import { SUPABASE_CLIENT } from '@/config/supabase.config.js';

// CONSTANTS //
import { ALLOWED_IMAGE_TYPES, IMAGE_MAGIC_BYTES, MAX_IMAGE_SIZE_BYTES } from '@/modules/media/media.constants.js';

// UTILS //
import { DependencyError, ValidationError } from '@/common/errors/domain.error.js';

// LIBRARIES //
import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

/** Wide enough for a hero banner on any layout this site renders; never upscaled. */
const MAX_IMAGE_WIDTH_PX = 1600;

/**
 * Social crawlers (WhatsApp in particular) are unreliable or outright fail to
 * fetch a link-preview image above roughly this size - an admin-uploaded
 * photo straight off a phone routinely lands in the 2-5 MB range, well past
 * that. Quality steps down until the encoded result fits, or the floor is hit.
 */
const TARGET_MAX_BYTES = 500 * 1024;
const JPEG_QUALITY_STEPS = [82, 70, 60, 45];

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

    // Re-encoded to JPEG regardless of the source format and capped to a
    // reasonable width: an admin-uploaded photo routinely lands well past
    // what social crawlers reliably fetch for a link preview (see
    // TARGET_MAX_BYTES). This is also what every hero image and inline
    // Story image goes through, not just the one flagged for sharing.
    const optimisedBuffer = await this.optimiseImageService(file.buffer);

    // The stored name is generated, never taken from originalname: the client
    // controls that string, and it decides both the storage path and the
    // extension the bucket serves the object as.
    const path = `articles/${Date.now()}-${randomUUID()}.jpg`;

    const uploadResult = await this.supabase.storage
      .from(appConfig.storageBucket)
      .upload(path, optimisedBuffer, {
        cacheControl: '3600',
        contentType: 'image/jpeg',
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
   * Resizes and re-encodes an uploaded image so it stays small enough for a
   * social crawler to fetch reliably as a link-preview image.
   *
   * Quality steps down through JPEG_QUALITY_STEPS until the result fits
   * TARGET_MAX_BYTES; the lowest step is accepted even if it does not,
   * rather than looping indefinitely on an unusually dense source image.
   *
   * @param buffer - Original, already-validated image bytes
   * @returns Re-encoded JPEG bytes
   */
  private async optimiseImageService(buffer: Buffer): Promise<Buffer> {
    // .rotate() with no argument reads the image's own EXIF orientation and
    // bakes it in - without this a photo taken on a phone held sideways can
    // come out rotated once EXIF is stripped by the format conversion below.
    const resized = sharp(buffer)
      .rotate()
      .resize({ width: MAX_IMAGE_WIDTH_PX, withoutEnlargement: true });

    let encoded = await resized.jpeg({ quality: JPEG_QUALITY_STEPS[0], mozjpeg: true }).toBuffer();

    for (const quality of JPEG_QUALITY_STEPS.slice(1)) {
      if (encoded.length <= TARGET_MAX_BYTES) {
        break;
      }

      encoded = await sharp(buffer)
        .rotate()
        .resize({ width: MAX_IMAGE_WIDTH_PX, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    return encoded;
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
