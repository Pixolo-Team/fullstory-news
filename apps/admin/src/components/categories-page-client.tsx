'use client';

import { useState } from 'react';
import { LayersIcon } from '@/components/admin-icons';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSlugPreviewService } from '@/services/get-admin-demo-data.service';

/**
 * Renders Categories with working local add, edit, and delete actions.
 */
export function CategoriesPageClient() {
  // Define Navigation

  // Define Context
  const { categories, createCategory, updateCategory, deleteCategory } = useAdminDemoContext();

  // Define Refs

  // Define States
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Helper Functions
  const totalStories = categories.reduce((storyCount, category) => storyCount + category.storyCount, 0);

  /**
   * Resets the Category form to create mode.
   */
  const resetCategoryForm = (): void => {
    setEditingCategoryId(null);
    setName('');
    setSlug('');
  };

  /**
   * Loads a Category into the form for editing.
   */
  const handleEditCategory = (id: string): void => {
    const targetCategory = categories.find((category) => category.id === id);

    if (!targetCategory) {
      return;
    }

    setEditingCategoryId(id);
    setName(targetCategory.name);
    setSlug(targetCategory.slug);
  };

  /**
   * Saves the current Category form to the local dummy store.
   */
  const handleSaveCategory = (): void => {
    if (!name.trim()) {
      setNameError('Enter a Category name.');
      return;
    }

    setNameError(null);

    const categoryDraft = {
      name: name.trim(),
      slug: slug.trim() || getSlugPreviewService(name),
    };

    if (editingCategoryId) {
      updateCategory(editingCategoryId, categoryDraft);
    } else {
      createCategory(categoryDraft);
    }

    resetCategoryForm();
  };

  /**
   * Deletes a Category when no Story is linked to it.
   */
  const handleRequestDeleteCategory = (id: string): void => {
    const targetCategory = categories.find((category) => category.id === id);

    // A Category with Stories cannot be deleted - say so instead of opening a
    // confirmation the user cannot complete.
    if (targetCategory && targetCategory.storyCount > 0) {
      setBlockedMessage(
        `"${targetCategory.name}" still has ${targetCategory.storyCount} ${
          targetCategory.storyCount === 1 ? 'Story' : 'Stories'
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
   * Deletes the Category the confirmation is open for.
   */
  const handleConfirmDeleteCategory = (): void => {
    if (!pendingDeleteId) {
      return;
    }

    const didDeleteCategory = deleteCategory(pendingDeleteId);

    if (!didDeleteCategory) {
      setBlockedMessage('This Category still has linked Stories, so it cannot be deleted.');
      setPendingDeleteId(null);
      return;
    }

    if (editingCategoryId === pendingDeleteId) {
      resetCategoryForm();
    }

    setPendingDeleteId(null);
  };

  const pendingDeleteCategory = categories.find((category) => category.id === pendingDeleteId) ?? null;

  // Use Effects
  return (
    <div className="space-y-8">
      <PageHeader
        description="Category management stays intentionally simple: a small form plus a clear list with constraints."
        title="Categories"
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <div>
              <p className="admin-kicker">Categories</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <div>
              <p className="admin-kicker">Linked Stories</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">{totalStories}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="admin-metric-card">
          <CardContent className="py-6">
            <div>
              <p className="admin-kicker">Can add</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-ink">Yes</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <p className="admin-kicker">{editingCategoryId ? 'Update' : 'Create'}</p>
            <CardTitle>{editingCategoryId ? 'Edit category' : 'Add category'}</CardTitle>
            <CardDescription>Create or edit a navigation category for the public site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                aria-describedby={nameError ? 'category-name-error' : undefined}
                aria-invalid={nameError ? true : undefined}
                id="category-name"
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
              <Input id="category-slug" onChange={(event) => setSlug(event.target.value)} value={slug} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSaveCategory}>
                {editingCategoryId ? 'Save changes' : 'Add category'}
              </Button>
              {editingCategoryId ? (
                <Button onClick={resetCategoryForm} variant="outline">
                  Cancel
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="admin-kicker">Maintain</p>
            <CardTitle>Existing categories</CardTitle>
            <CardDescription>
              Deleting a Category with linked Stories should be blocked rather than cascaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category) => (
              <div className="admin-soft-panel flex flex-col gap-4 rounded-2xl border border-rule p-5 md:flex-row md:items-center md:justify-between" key={category.id}>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                    <LayersIcon className="h-3.5 w-3.5" />
                    Category
                  </div>
                  <p className="pt-2 text-lg font-semibold text-ink">{category.name}</p>
                  <p className="text-sm text-ink-muted">/{category.slug}</p>
                  <p className="text-sm text-ink-muted">Updated {category.updatedAt}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-right">
                    <p className="text-3xl font-semibold tracking-tight text-ink">
                      {category.storyCount}
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">Linked Stories</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEditCategory(category.id)} size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button onClick={() => handleRequestDeleteCategory(category.id)} size="sm" variant="ghost">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        confirmLabel="Delete Category"
        description={
          pendingDeleteCategory
            ? `"${pendingDeleteCategory.name}" will be removed. This cannot be undone.`
            : ''
        }
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
