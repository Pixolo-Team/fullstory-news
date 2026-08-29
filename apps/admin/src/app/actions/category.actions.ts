'use server';

// TYPES //
import type { ActionResultData } from '@/types/action-result.types';

// SERVICES //
import { sendBackendMutationRequest } from '@/requests/backend.request';

// LIBRARIES //
import { revalidatePath } from 'next/cache';

/**
 * Creates a Category from form input.
 * @param _previousState - Prior form state
 * @param formData - Submitted Category form values
 * @returns Success or error state
 */
export async function createCategoryAction(
  _previousState: ActionResultData,
  formData: FormData,
): Promise<ActionResultData> {
  const slug = String(formData.get('slug') ?? '').trim();

  const response = await sendBackendMutationRequest('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: String(formData.get('name') ?? '').trim(),
      ...(slug ? { slug } : {}),
    }),
  });

  if (response.status === 'error') {
    return { errorMessage: response.message, successMessage: null };
  }

  revalidatePath('/categories');
  return { errorMessage: null, successMessage: 'Category added' };
}

/**
 * Updates a Category from form input.
 * @param _previousState - Prior form state
 * @param formData - Submitted Category form values
 * @returns Success or error state
 */
export async function updateCategoryAction(
  _previousState: ActionResultData,
  formData: FormData,
): Promise<ActionResultData> {
  const categoryId = String(formData.get('id') ?? '');
  const slug = String(formData.get('slug') ?? '').trim();

  const response = await sendBackendMutationRequest(`/api/categories/${categoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: String(formData.get('name') ?? '').trim(),
      ...(slug ? { slug } : {}),
    }),
  });

  if (response.status === 'error') {
    return { errorMessage: response.message, successMessage: null };
  }

  revalidatePath('/categories');
  return { errorMessage: null, successMessage: 'Category updated' };
}

/**
 * Deletes a Category.
 * @param _previousState - Prior form state
 * @param formData - Form values carrying the category id
 * @returns Success or error state
 */
export async function deleteCategoryAction(
  _previousState: ActionResultData,
  formData: FormData,
): Promise<ActionResultData> {
  const categoryId = String(formData.get('id') ?? '');

  const response = await sendBackendMutationRequest(`/api/categories/${categoryId}`, {
    method: 'DELETE',
  });

  if (response.status === 'error') {
    return { errorMessage: response.message, successMessage: null };
  }

  revalidatePath('/categories');
  return { errorMessage: null, successMessage: 'Category deleted' };
}
