'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getSlugPreviewService } from '@/services/get-admin-demo-data.service';
import type { StoryEditorData, StoryStatusData } from '@/types/admin.types';

interface StoryFormProps {
  story: StoryEditorData;
  title: string;
  description: string;
  onSaveStory: (story: StoryEditorData, nextStatus: StoryStatusData) => void;
}

const CATEGORY_OPTIONS = ['World', 'Tech', 'Politics', 'Sports'];
const AUTHOR_OPTIONS = ['Amina Khan', 'Rohan Shah', 'Sara Thomas', 'Daniel Roy'];

/**
 * Renders the create/edit Story form using dummy data.
 */
export function StoryForm({ story, title, description, onSaveStory }: StoryFormProps) {
  // Define Navigation
  const router = useRouter();

  // Define Context

  // Define Refs

  // Define States
  const [headline, setHeadline] = useState<string>(story.headline);
  const [subHeadline, setSubHeadline] = useState<string>(story.subHeadline);
  const [slug, setSlug] = useState<string>(story.slug);
  const [categoryName, setCategoryName] = useState<string>(story.categoryName);
  const [authorName, setAuthorName] = useState<string>(story.authorName);
  const [heroImageUrl, setHeroImageUrl] = useState<string>(story.heroImageUrl);
  const [tagsText, setTagsText] = useState<string>(story.tagsText);
  const [contentHtml, setContentHtml] = useState<string>(story.contentHtml);

  // Helper Functions
  const isPublished = story.status === 'published';

  /**
   * Builds the latest Story payload from local form state.
   */
  const getStoryPayload = (): StoryEditorData => ({
    id: story.id,
    headline,
    subHeadline,
    slug: slug.trim() || getSlugPreviewService(headline),
    categoryName,
    authorName,
    heroImageUrl,
    tagsText,
    status: story.status,
    publishedAt: story.publishedAt,
    contentHtml,
  });

  /**
   * Saves the Story as a draft.
   */
  const handleSaveDraft = (): void => {
    onSaveStory(getStoryPayload(), 'draft');
  };

  /**
   * Publishes the Story.
   */
  const handlePublishStory = (): void => {
    onSaveStory(getStoryPayload(), 'published');
  };

  const isNewStory = story.id === 'new-story';

  /**
   * Opens a local preview for an existing saved Story.
   */
  const handlePreviewStory = (): void => {
    router.push(`/stories/${story.id}/preview`);
  };

  // Use Effects

  return (
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
              <Input id="headline" onChange={(event) => setHeadline(event.target.value)} placeholder="Enter the Story headline" value={headline} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sub-headline">Sub-headline</Label>
              <Textarea
                className="min-h-24"
                id="sub-headline"
                onChange={(event) => setSubHeadline(event.target.value)}
                placeholder="Add supporting context beneath the headline"
                value={subHeadline}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" onChange={(event) => setSlug(event.target.value)} placeholder="story-slug" value={slug} />
              {isPublished ? (
                <p className="text-xs text-ink-muted">
                  Changing the slug of a published Story should trigger a warning because the public URL changes.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero-image-url">Hero image URL</Label>
              <Input
                id="hero-image-url"
                onChange={(event) => setHeroImageUrl(event.target.value)}
                placeholder="https://images.example.com/story.jpg"
                value={heroImageUrl}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select id="category" onChange={(event) => setCategoryName(event.target.value)} value={categoryName}>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Select id="author" onChange={(event) => setAuthorName(event.target.value)} value={authorName}>
                {AUTHOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" onChange={(event) => setTagsText(event.target.value)} placeholder="climate, elections, transport" value={tagsText} />
              <p className="text-xs text-ink-muted">
                Comma-separated for now. Real validation can land when the API wiring begins.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content-html">Story body</Label>
              <Textarea
                className="min-h-72 font-mono text-[13px]"
                id="content-html"
                onChange={(event) => setContentHtml(event.target.value)}
                placeholder="<p>Write Story HTML here</p>"
                value={contentHtml}
              />
              <p className="text-xs text-ink-muted">
                Temporary textarea placeholder until the rich text editor decision is closed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>Separate draft and publish actions reflect the planned workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm text-ink-muted">
              <p>
                <span className="font-medium text-ink">Status:</span> {story.status}
              </p>
              <p>
                <span className="font-medium text-ink">Published at:</span>{' '}
                {story.publishedAt ?? 'Not published yet'}
              </p>
            </div>
            <div className="grid gap-3">
              <Button onClick={handleSaveDraft}>Save draft</Button>
              <Button onClick={handlePublishStory} variant="outline">Publish Story</Button>
              {isNewStory ? null : (
                <Button onClick={handlePreviewStory} variant="ghost">Preview Story</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety checks</CardTitle>
            <CardDescription>Important rules we already know from the project brief.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-ink-muted">
            <p>Public UI uses the word Story, while the database and backend use article.</p>
            <p>Publishing should set `published_at` the first time only.</p>
            <p>Deleting remains a confirmed action, not a single-click button.</p>
            <Link className="text-accent underline-offset-4 hover:underline" href="/stories">
              Back to Stories
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
