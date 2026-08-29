/** Maximum upload size in bytes. Enforced by the interceptor and the service. */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Content types an upload may declare. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Leading bytes that identify each accepted format.
 *
 * The declared mimetype is client-supplied, so it is checked against the
 * file's actual signature before anything is stored.
 */
export const IMAGE_MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // RIFF....WEBP - bytes 8-11 are checked separately.
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
};

/** File extension stored for each accepted type. */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
