'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  getCurrentAdminTimestampService,
  getDefaultCategoriesDataService,
  getDefaultStoriesDataService,
  getSlugPreviewService,
} from '@/services/get-admin-demo-data.service';
import type {
  CategoryListItemData,
  StoryEditorData,
  StoryListItemData,
  StoryStatusData,
} from '@/types/admin.types';

interface CategoryDraftData {
  name: string;
  slug: string;
}

interface AdminDemoContextData {
  isAuthenticated: boolean;
  stories: StoryListItemData[];
  categories: CategoryListItemData[];
  signIn: () => void;
  signOut: () => void;
  createStory: (story: StoryEditorData, nextStatus?: StoryStatusData) => string;
  updateStory: (id: string, story: StoryEditorData, nextStatus?: StoryStatusData) => void;
  deleteStory: (id: string) => void;
  createCategory: (category: CategoryDraftData) => void;
  updateCategory: (id: string, category: CategoryDraftData) => void;
  deleteCategory: (id: string) => boolean;
}

const STORIES_STORAGE_KEY = 'full-story-admin-demo-stories';
const CATEGORIES_STORAGE_KEY = 'full-story-admin-demo-categories';
const AUTH_STORAGE_KEY = 'full-story-admin-demo-auth';

const AdminDemoContext = createContext<AdminDemoContextData | null>(null);

/**
 * Builds a Story row from editor values and the chosen publishing status.
 */
function getStoryListItemService(
  story: StoryEditorData,
  nextStatus: StoryStatusData,
  existingStory?: StoryListItemData,
): StoryListItemData {
  const currentTimestamp = getCurrentAdminTimestampService();
  const publishedAt =
    nextStatus === 'published'
      ? existingStory?.publishedAt ?? currentTimestamp
      : null;

  return {
    id: existingStory?.id ?? `story-${Date.now()}`,
    headline: story.headline.trim(),
    subHeadline: story.subHeadline.trim(),
    slug: story.slug.trim() || getSlugPreviewService(story.headline),
    categoryName: story.categoryName,
    authorName: story.authorName,
    status: nextStatus,
    updatedAt: currentTimestamp,
    publishedAt,
    viewCount: existingStory?.viewCount ?? '0',
    heroImageUrl: story.heroImageUrl.trim(),
    tags: story.tagsText
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

/**
 * Builds a Category row from form values.
 */
function getCategoryListItemService(
  category: CategoryDraftData,
  existingCategory?: CategoryListItemData,
): CategoryListItemData {
  return {
    id: existingCategory?.id ?? `category-${Date.now()}`,
    name: category.name.trim(),
    slug: category.slug.trim() || getSlugPreviewService(category.name),
    storyCount: existingCategory?.storyCount ?? 0,
    updatedAt: getCurrentAdminTimestampService(),
  };
}

/**
 * Recalculates Category Story counts from the current Story list.
 */
function getCategoriesWithStoryCountsService(
  categories: CategoryListItemData[],
  stories: StoryListItemData[],
): CategoryListItemData[] {
  return categories.map((category) => ({
    ...category,
    storyCount: stories.filter((story) => story.categoryName === category.name).length,
  }));
}

interface AdminDemoProviderProps {
  children: ReactNode;
}

/**
 * Provides a persistent local dummy store for the admin experience.
 */
export function AdminDemoProvider({ children }: AdminDemoProviderProps) {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [stories, setStories] = useState<StoryListItemData[]>(getDefaultStoriesDataService());
  const [categories, setCategories] = useState<CategoryListItemData[]>(getDefaultCategoriesDataService());

  // Helper Functions
  /**
   * Signs into the local dummy admin experience.
   */
  const signIn = (): void => {
    setIsAuthenticated(true);
  };

  /**
   * Signs out of the local dummy admin experience.
   */
  const signOut = (): void => {
    setIsAuthenticated(false);
  };

  /**
   * Creates a Story in the local dummy store.
   */
  const createStory = (story: StoryEditorData, nextStatus: StoryStatusData = 'draft'): string => {
    const nextStory = getStoryListItemService(story, nextStatus);

    setStories((currentStories) => {
      const updatedStories = [nextStory, ...currentStories];

      setCategories((currentCategories) =>
        getCategoriesWithStoryCountsService(currentCategories, updatedStories),
      );

      return updatedStories;
    });

    return nextStory.id;
  };

  /**
   * Updates a Story in the local dummy store.
   */
  const updateStory = (
    id: string,
    story: StoryEditorData,
    nextStatus: StoryStatusData = 'draft',
  ): void => {
    setStories((currentStories) => {
      const existingStory = currentStories.find((currentStory) => currentStory.id === id);
      const updatedStories = currentStories.map((currentStory) =>
        currentStory.id === id
          ? getStoryListItemService(story, nextStatus, existingStory)
          : currentStory,
      );

      setCategories((currentCategories) =>
        getCategoriesWithStoryCountsService(currentCategories, updatedStories),
      );

      return updatedStories;
    });
  };

  /**
   * Deletes a Story from the local dummy store.
   */
  const deleteStory = (id: string): void => {
    setStories((currentStories) => {
      const updatedStories = currentStories.filter((story) => story.id !== id);

      setCategories((currentCategories) =>
        getCategoriesWithStoryCountsService(currentCategories, updatedStories),
      );

      return updatedStories;
    });
  };

  /**
   * Creates a Category in the local dummy store.
   */
  const createCategory = (category: CategoryDraftData): void => {
    setCategories((currentCategories) => [
      getCategoryListItemService(category),
      ...currentCategories,
    ]);
  };

  /**
   * Updates a Category and relabels linked Stories.
   */
  const updateCategory = (id: string, category: CategoryDraftData): void => {
    setCategories((currentCategories) => {
      const existingCategory = currentCategories.find((currentCategory) => currentCategory.id === id);

      if (!existingCategory) {
        return currentCategories;
      }

      const updatedCategory = getCategoryListItemService(category, existingCategory);
      const updatedStories = stories.map((story) =>
        story.categoryName === existingCategory.name
          ? { ...story, categoryName: updatedCategory.name, updatedAt: getCurrentAdminTimestampService() }
          : story,
      );

      setStories(updatedStories);

      return getCategoriesWithStoryCountsService(
        currentCategories.map((currentCategory) =>
          currentCategory.id === id ? updatedCategory : currentCategory,
        ),
        updatedStories,
      );
    });
  };

  /**
   * Deletes a Category when it has no linked Stories.
   */
  const deleteCategory = (id: string): boolean => {
    const targetCategory = categories.find((category) => category.id === id);

    if (!targetCategory) {
      return false;
    }

    if (stories.some((story) => story.categoryName === targetCategory.name)) {
      return false;
    }

    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== id),
    );

    return true;
  };

  // Use Effects
  useEffect(() => {
    const storedStories = localStorage.getItem(STORIES_STORAGE_KEY);
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const storedAuthState = localStorage.getItem(AUTH_STORAGE_KEY);

    if (storedStories) {
      setStories(JSON.parse(storedStories) as StoryListItemData[]);
    }

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories) as CategoryListItemData[]);
    }

    setIsAuthenticated(storedAuthState === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, String(isAuthenticated));
  }, [isAuthenticated]);

  return (
    <AdminDemoContext.Provider
      value={{
        isAuthenticated,
        stories,
        categories,
        signIn,
        signOut,
        createStory,
        updateStory,
        deleteStory,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </AdminDemoContext.Provider>
  );
}

/**
 * Returns the shared local dummy admin store.
 */
export function useAdminDemoContext(): AdminDemoContextData {
  const adminDemoContext = useContext(AdminDemoContext);

  if (!adminDemoContext) {
    throw new Error('useAdminDemoContext must be used within AdminDemoProvider.');
  }

  return adminDemoContext;
}
