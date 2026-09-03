'use server';

// TYPES //
import type { ActionResultData } from '@/types/action-result.types';
import type { ArticleDetailData } from '@/types/api.types';

// SERVICES //
import { sendBackendMutationRequest } from '@/requests/backend.request';
import { parseListFieldService } from '@/services/parse-list-field.service';

// LIBRARIES //
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Builds the article payload shared by create and update.
 * @param formData - Submitted Story form values
 * @returns Article payload for the backend
 */
function buildArticlePayload(formData: FormData): Record<string, unknown> {
  const heroImageUrl = String(formData.get('heroImageUrl') ?? '').trim();
  const subHeadline = String(formData.get('subHeadline') ?? '').trim();

  return {
    headline: String(formData.get('headline') ?? '').trim(),
    // The backend rejects an empty string for a URL, so omit the field instead.
    ...(heroImageUrl ? { heroImageUrl } : {}),
    ...(subHeadline ? { subHeadline } : {}),
    slug: String(formData.get('slug') ?? '').trim() || undefined,
    categoryId: String(formData.get('categoryId') ?? ''),
    contentHtml: String(formData.get('contentHtml') ?? ''),
    tags: parseListFieldService(formData.get('tags')),
  };
}

/**
 * Creates a Story from form input.
 * @param _previousState - Prior form state
 * @param formData - Submitted Story form values
 * @returns Error state, or redirects to the new Story on success
 */
export async function createArticleAction(
  _previousState: ActionResultData,
  formData: FormData,
): Promise<ActionResultData> {
  const response = await sendBackendMutationRequest<{ id: string }>('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildArticlePayload(formData)),
  });

  if (response.status === 'error' || !response.data) {
    return { errorMessage: response.message, successMessage: null };
  }

  const articleId = response.data.id;

  // The API always creates a draft, so publishing is a second call. A missing
  // status means the form was submitted without a button - stay a draft rather
  // than publish something by accident.
  if (formData.get('status') === 'published') {
    const publishResponse = await sendBackendMutationRequest(`/api/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });

    if (publishResponse.status === 'error') {
      return {
        errorMessage: `Story was created but could not be published: ${publishResponse.message}`,
        successMessage: null,
      };
    }
  }

  // Creating an article never sent the Instagram field to the backend - only
  // updateArticleAction did - so a reel added while writing a brand-new Story
  // was silently dropped. The create endpoint has nowhere to take Instagram
  // URLs itself, so this is the same second call updateArticleAction makes.
  const instagramUrls = parseListFieldService(formData.get('instagramUrls'));
  if (instagramUrls.length > 0) {
    const instagramResponse = await sendBackendMutationRequest(`/api/articles/${articleId}/instagram`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: instagramUrls }),
    });

    if (instagramResponse.status === 'error') {
      return {
        errorMessage: `Story was created but the Instagram links failed: ${instagramResponse.message}`,
        successMessage: null,
      };
    }
  }

  revalidatePath('/stories');
  redirect(`/stories/${articleId}?saved=1`);
}

/**
 * Updates a Story from form input.
 * @param _previousState - Prior form state
 * @param formData - Submitted Story form values
 * @returns Success or error state
 */
export async function updateArticleAction(
  _previousState: ActionResultData,
  formData: FormData,
): Promise<ActionResultData> {
  const articleId = String(formData.get('id') ?? '');
  const rawStatus = formData.get('status');
  const submittedStatus =
    rawStatus === 'published' || rawStatus === 'draft' ? rawStatus : null;

  const response = await sendBackendMutationRequest<ArticleDetailData>(
    `/api/articles/${articleId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buildArticlePayload(formData),
        // Omit status entirely when no submit button supplied one, so the
        // backend leaves the current status alone. Defaulting either way
        // could silently publish a draft or unpublish a live Story.
        ...(submittedStatus ? { status: submittedStatus } : {}),
      }),
    },
  );

  if (response.status === 'error') {
    return { errorMessage: response.message, successMessage: null };
  }

  const instagramResponse = await sendBackendMutationRequest(
    `/api/articles/${articleId}/instagram`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: parseListFieldService(formData.get('instagramUrls')) }),
    },
  );

  if (instagramResponse.status === 'error') {
    return {
      errorMessage: `Story saved, but the Instagram links failed: ${instagramResponse.message}`,
      successMessage: null,
    };
  }

  revalidatePath('/stories');
  revalidatePath(`/stories/${articleId}`);

  return {
    errorMessage: null,
    successMessage:
      response.data?.status === 'published'
        ? 'Story published successfully'
        : 'Draft saved successfully',
  };
}

/**
 * Deletes a Story.
 * @param _previousState - Prior form state
 * @param formData - Form values carrying the article id
 * @returns Success or error state
 */
export async function deleteArticleAction(
  _previousState: ActionResultData,
  formData: FormData,
): Promise<ActionResultData> {
  const articleId = String(formData.get('id') ?? '');

  const response = await sendBackendMutationRequest(`/api/articles/${articleId}`, {
    method: 'DELETE',
  });

  if (response.status === 'error') {
    return { errorMessage: response.message, successMessage: null };
  }

  // No redirect: the caller is already on /stories, so revalidating re-renders
  // the list in place instead of forcing a full navigation.
  revalidatePath('/stories');

  return { errorMessage: null, successMessage: 'Story deleted successfully' };
}
