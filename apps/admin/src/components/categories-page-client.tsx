'use client';

// TYPES //
import type { CategoryData } from '@/types/api.types';

// SERVICES //
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from '@/app/actions/category.actions';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateService } from '@/services/format-date.service';
import { useToast } from '@/components/ui/toast';

// CONSTANTS //
import { EMPTY_ACTION_RESULT } from '@/types/action-result.types';

// LIBRARIES //
import { useActionState, useEffect, useRef, useState } from 'react';

interface CategoriesPageClientProps {
  categories: CategoryData[];
}

/**
 * Renders Category management. Writes go through server actions; the list is
 * revalidated by the server after each one.
 */
export function CategoriesPageClient({ categories }: CategoriesPageClientProps) {
  // Define Navigation

  // Define Context
  const { showToast } = useToast();

  // Define Refs
  const deleteFormRef = useRef<HTMLFormElement>(null);

  // Define States
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saveState, submitCategory, isSaving] = useActionState(
    editingCategoryId ? updateCategoryAction : createCategoryAction,
    EMPTY_ACTION_RESULT,
  );
  const [deleteState, submitDelete, isDeleting] = useActionState(
    deleteCategoryAction,
    EMPTY_ACTION_RESULT,
  );

  // Helper Functions
  const totalArticles = categories.reduce(
    (articleCount, category) => articleCount + (category.articleCount ?? 0),
    0,
  );
  const pendingDeleteCategory =
    categories.find((category) => category.id === pendingDeleteId) ?? null;

  /**
   * Resets the Category form back to create mode.
   */
  const resetCategoryForm = (): void => {
    setEditingCategoryId(null);
    setName('');
    setSlug('');
    setNameError(null);
  };

  /**
   * Loads a Category into the form for editing.
   */
  const startEditingCategory = (category: CategoryData): void => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setNameError(null);
  };

  /**
   * Blocks submission when the name is empty.
   */
  const handleSubmitCategory = (event: React.FormEvent<HTMLFormElement>): void => {
    if (!name.trim()) {
      event.preventDefault();
      setNameError('Enter a Category name.');
    }
  };

  /**
   * Opens the delete confirmation, or explains why deletion is blocked.
   */
  const handleRequestDeleteCategory = (id: string): void => {
    const targetCategory = categories.find((category) => category.id === id);
    const articleCount = targetCategory?.articleCount ?? 0;

    // A Category with Stories cannot be deleted, so say that instead of
    // opening a confirmation the user cannot complete.
    if (targetCategory && articleCount > 0) {
      setBlockedMessage(
        `"${targetCategory.name}" still has ${articleCount} ${
          articleCount === 1 ? 'Story' : 'Stories'
        }. Move them to another Category first.`,
      );
      return;
    }

    setPendingDeleteId(id);
  };

  /**
   * Closes the delete confirmation without deleting.
   */
  const handleCancelDeleteCategory = (): void => {
    setPendingDeleteId(null);
  };

  /**
   * Submits the hidden form so the delete runs as a server action.
   */
  const handleConfirmDeleteCategory = (): void => {
    deleteFormRef.current?.requestSubmit();

    if (editingCategoryId === pendingDeleteId) {
      resetCategoryForm();
    }

    setPendingDeleteId(null);
  };

  // Use Effects
  // One effect per action. Watching both in a single effect re-fired the other
  // action's message every time either one changed - a save would re-show the
  // previous delete's toast.
  useEffect(() => {
    if (saveState.errorMessage) {
      showToast({ title: 'Could not save Category', description: saveState.errorMessage, tone: 'error' });
    }

    if (saveState.successMessage) {
      showToast({ title: saveState.successMessage, tone: 'success' });
      resetCategoryForm();
    }
  }, [saveState]);

  useEffect(() => {
    if (deleteState.errorMessage) {
      showToast({
        title: 'Could not delete Category',
        description: deleteState.errorMessage,
        tone: 'error',
      });
    }

    if (deleteState.successMessage) {
      showToast({ title: deleteState.successMessage, tone: 'success' });
    }
  }, [deleteState]);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Categories drive the public navigation, so keep the list short and the names plain."
        title="Categories"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <p className="admin-kicker">Categories</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">
              {categories.length}
            </p>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <p className="admin-kicker">Linked Stories</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{totalArticles}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <p className="admin-kicker">{editingCategoryId ? 'Update' : 'Create'}</p>
            <CardTitle>{editingCategoryId ? 'Edit Category' : 'New Category'}</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              action={submitCategory}
              className="space-y-4"
              onSubmit={handleSubmitCategory}
            >
              {editingCategoryId ? (
                <input name="id" type="hidden" value={editingCategoryId} readOnly />
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  aria-describedby={nameError ? 'category-name-error' : undefined}
                  aria-invalid={nameError ? true : undefined}
                  id="category-name"
                  name="name"
                  onChange={(event) => {
                    setName(event.target.value);
                    setNameError(null);
                  }}
                  value={name}
                />
                {nameError ? (
                  <p className="text-xs text-danger" id="category-name-error">
                    {nameError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-slug">Slug</Label>
                <Input
                  id="category-slug"
                  name="slug"
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="Generated from the name when left empty"
                  value={slug}
                />
                {editingCategoryId ? (
                  <p className="text-xs text-ink-muted">
                    Changing the slug changes the public /{slug} URL. Existing links will break.
                  </p>
                ) : null}
              </div>

              <div className="flex gap-3">
                <Button disabled={isSaving} type="submit">
                  {isSaving ? 'Saving...' : editingCategoryId ? 'Save Category' : 'Add Category'}
                </Button>
                {editingCategoryId ? (
                  <Button onClick={resetCategoryForm} type="button" variant="ghost">
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-rule">
            <p className="admin-kicker">Manage</p>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>

          <CardContent>
            {categories.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-muted">No Categories yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="text-left text-sm text-ink-muted">
                      <th className="border-b border-rule px-4 py-3 font-medium">Name</th>
                      <th className="border-b border-rule px-4 py-3 font-medium">Slug</th>
                      <th className="border-b border-rule px-4 py-3 font-medium">Stories</th>
                      <th className="border-b border-rule px-4 py-3 font-medium">Updated</th>
                      <th className="w-px whitespace-nowrap border-b border-rule px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="border-b border-rule px-4 py-4 text-sm font-semibold text-ink">
                          {category.name}
                        </td>
                        <td className="border-b border-rule px-4 py-4 text-sm text-ink-muted">
                          /{category.slug}
                        </td>
                        <td className="border-b border-rule px-4 py-4 text-sm text-ink">
                          {category.articleCount ?? 0}
                        </td>
                        <td className="border-b border-rule px-4 py-4 text-sm text-ink-muted">
                          {formatDateService(category.updatedAt)}
                        </td>
                        <td className="w-px whitespace-nowrap border-b border-rule px-4 py-4">
                          <div className="flex flex-nowrap items-center gap-2">
                            <Button
                              onClick={() => startEditingCategory(category)}
                              size="sm"
                              variant="outline"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleRequestDeleteCategory(category.id)}
                              size="sm"
                              variant="ghost"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <form action={submitDelete} className="hidden" ref={deleteFormRef}>
        <input name="id" type="hidden" value={pendingDeleteId ?? ''} readOnly />
      </form>

      <ConfirmDialog
        confirmLabel="Delete Category"
        description={
          pendingDeleteCategory
            ? `"${pendingDeleteCategory.name}" will be removed. This cannot be undone.`
            : ''
        }
        busy={isDeleting}
        onCancel={handleCancelDeleteCategory}
        onConfirm={handleConfirmDeleteCategory}
        open={pendingDeleteId !== null}
        title="Delete this Category?"
        tone="danger"
      />

      <ConfirmDialog
        cancelLabel="Close"
        confirmLabel="Got it"
        description={blockedMessage ?? ''}
        onCancel={() => setBlockedMessage(null)}
        onConfirm={() => setBlockedMessage(null)}
        open={blockedMessage !== null}
        title="Category cannot be deleted"
      />
    </div>
  );
}
