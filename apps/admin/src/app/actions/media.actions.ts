'use server';

// SERVICES //
import { sendBackendMutationRequest } from '@/requests/backend.request';

interface UploadImageResultData {
  url: string | null;
  errorMessage: string | null;
}

/**
 * Uploads an image file to Supabase Storage via the backend.
 *
 * Called directly from client components (the hero image field, the Story
 * editor's image button) rather than through a form submission, so it takes
 * FormData and returns a plain result instead of the ActionResultData shape
 * useActionState expects.
 *
 * @param formData - Must contain the file under the "file" field, matching
 *   the backend's FileInterceptor('file')
 * @returns The stored file's public URL, or an error message
 */
export async function uploadImageAction(formData: FormData): Promise<UploadImageResultData> {
  const response = await sendBackendMutationRequest<{ url: string }>('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (response.status === 'error' || !response.data) {
    return { url: null, errorMessage: response.message };
  }

  return { url: response.data.url, errorMessage: null };
}
