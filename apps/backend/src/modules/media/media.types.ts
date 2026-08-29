/**
 * Stored image upload payload.
 */
export interface UploadedImageData {
  url: string;
}

/**
 * Minimal uploaded-file shape used by the media service.
 */
export interface UploadedFileData {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
