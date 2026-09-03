'use client';

// TYPES //
import type { ArticleDetailData, CategoryData } from '@/types/api.types';

// SERVICES //
import { createArticleAction, updateArticleAction } from '@/app/actions/article.actions';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Textarea } from '@/components/ui/textarea';
import { formatDateService } from '@/services/format-date.service';

// LIBRARIES //
import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';

// CONSTANTS //
import { EMPTY_ACTION_RESULT } from '@/types/action-result.types';

interface StoryFormProps {
  article: ArticleDetailData | null;
  categories: CategoryData[];
  categoryErrorMessage?: string | null;
  title: string;
  description: string;
}

/**
 * Renders the create and edit Story form.
 *
 * Submits to a server action, so the field names below are the API contract.
 */
export function StoryForm({
  article,
  categories,
  categoryErrorMessage = null,
  title,
  description,
}: StoryFormProps) {
  // Define Navigation

  // Define Context
  const { showToast } = useToast();

  // Define Refs
  const statusInputRef = useRef<HTMLInputElement>(null);

  // Define States
  const [slug, setSlug] = useState<string>(article?.slug ?? '');
  const [pendingStatus, setPendingStatus] = useState<'draft' | 'published' | null>(null);
  const [actionState, submitArticle, isSubmitting] = useActionState(
    article ? updateArticleAction : createArticleAction,
    EMPTY_ACTION_RESULT,
  );

  // Helper Functions
  const isEditing = article !== null;
  const isPublished = article?.status === 'published';
  const savedSlug = article?.slug ?? '';
  const hasSlugChanged = isPublished && slug !== savedSlug;
  const hasCategories = categories.length > 0;
  const isSubmitDisabled = isSubmitting || (!isEditing && !hasCategories);

  /**
   * Writes the intended status into the form before it submits.
   *
   * A submit button's name/value is not reliably serialised into the FormData
   * a server action receives, which silently dropped the status and left every
   * save as a draft. Setting a hidden field on click is synchronous and always
   * arrives.
   */
  const setSubmitStatus = (nextStatus: 'draft' | 'published'): void => {
    if (statusInputRef.current) {
      statusInputRef.current.value = nextStatus;
    }

    setPendingStatus(nextStatus);
  };

  // Use Effects
  useEffect(() => {
    if (actionState.errorMessage) {
      showToast({ title: 'Could not save', description: actionState.errorMessage, tone: 'error' });
    }

    if (actionState.successMessage) {
      showToast({ title: actionState.successMessage, tone: 'success' });
    }

    setPendingStatus(null);
  }, [actionState, showToast]);

  return (
    <form action={submitArticle}>
      {isEditing ? <input name="id" type="hidden" value={article.id} readOnly /> : null}
      <input defaultValue="published" name="status" ref={statusInputRef} type="hidden" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  defaultValue={article?.headline ?? ''}
                  id="headline"
                  name="headline"
                  placeholder="Enter the Story headline"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="sub-headline">Sub-headline</Label>
                <Textarea
                  className="min-h-24"
                  defaultValue={article?.subHeadline ?? ''}
                  id="sub-headline"
                  name="subHeadline"
                  placeholder="Add supporting context beneath the headline"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="Generated from the headline when left empty"
                  value={slug}
                />
                {hasSlugChanged ? (
                  <p className="text-xs text-danger">
                    This Story is published. Changing the slug breaks every existing link to
                    /story/{savedSlug}.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero-image-url">Hero image</Label>
                <ImageUploadField
                  defaultValue={article?.heroImageUrl ?? ''}
                  id="hero-image-url"
                  name="heroImageUrl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  defaultValue={article?.category.id ?? categories[0]?.id ?? ''}
                  disabled={!hasCategories}
                  id="category"
                  name="categoryId"
                  required
                >
                  {!hasCategories ? (
                    <option value="">Categories unavailable</option>
                  ) : null}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {categoryErrorMessage ? (
                  <p className="text-xs text-danger">
                    Categories could not be loaded yet: {categoryErrorMessage}
                  </p>
                ) : null}
                {!hasCategories ? (
                  <p className="text-xs text-ink-muted">
                    The form stays available, but saving is disabled until Categories can be loaded.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  defaultValue={article?.tags.join(', ') ?? ''}
                  id="tags"
                  name="tags"
                  placeholder="climate, elections, transport"
                />
                <p className="text-xs text-ink-muted">Separate with commas.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="instagram-urls">Related Instagram posts</Label>
                <Textarea
                  className="min-h-24 font-mono text-[13px]"
                  defaultValue={
                    article?.instagramPosts.map((post) => post.instagramUrl).join('\n') ?? ''
                  }
                  id="instagram-urls"
                  name="instagramUrls"
                  placeholder="https://instagram.com/p/..."
                />
                <p className="text-xs text-ink-muted">One URL per line. Order is preserved.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="content-html">Story body</Label>
                <RichTextEditor defaultValue={article?.contentHtml ?? ''} name="contentHtml" />
                <p className="text-xs text-ink-muted">
                  Formatting is limited to what a Story page renders: headings, lists, quotes,
                  links and images.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>Publish when it is ready. Drafts are never public.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm text-ink-muted">
                <p>
                  <span className="font-medium text-ink">Status:</span>{' '}
                  {article?.status ?? 'draft'}
                </p>
                <p>
                  <span className="font-medium text-ink">Published:</span>{' '}
                  {article?.publishedAt ? formatDateService(article.publishedAt) : 'Not published'}
                </p>
              </div>

              <div className="grid gap-3">
                <Button
                  disabled={isSubmitDisabled}
                  onClick={() => setSubmitStatus('published')}
                  type="submit"
                >
                  {isSubmitting && pendingStatus === 'published'
                    ? 'Publishing...'
                    : isPublished
                      ? 'Update published Story'
                      : 'Publish Story'}
                </Button>
                <Button
                  disabled={isSubmitDisabled}
                  onClick={() => setSubmitStatus('draft')}
                  type="submit"
                  variant="ghost"
                >
                  {isSubmitting && pendingStatus === 'draft'
                    ? 'Saving...'
                    : isPublished
                      ? 'Unpublish and save as draft'
                      : 'Save draft'}
                </Button>
              </div>

              <Link
                className="block text-sm text-accent underline-offset-4 hover:underline"
                href="/stories"
              >
                Back to Stories
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
