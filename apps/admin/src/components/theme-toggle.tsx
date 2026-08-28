'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@/components/admin-icons';

type ThemeModeData = 'light' | 'dark';

const THEME_STORAGE_KEY = 'full-story-admin-theme';

/**
 * Applies the selected theme to the document root and persists it locally.
 */
function applyThemeModeService(themeMode: ThemeModeData): void {
  document.documentElement.dataset.theme = themeMode;
  localStorage.setItem(THEME_STORAGE_KEY, themeMode);
}

/**
 * Renders a light and dark mode switch for the admin panel.
 */
export function ThemeToggle() {
  // Define Navigation

  // Define Context

  // Define Refs

  // Define States
  const [themeMode, setThemeMode] = useState<ThemeModeData>('light');
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  // Helper Functions
  /**
   * Toggles the admin panel theme between light and dark.
   */
  const toggleThemeMode = (): void => {
    const nextThemeMode = themeMode === 'light' ? 'dark' : 'light';

    setThemeMode(nextThemeMode);
    applyThemeModeService(nextThemeMode);
  };

  // Use Effects
  useEffect(() => {
    const storedThemeMode = localStorage.getItem(THEME_STORAGE_KEY);
    const resolvedThemeMode = storedThemeMode === 'dark' ? 'dark' : 'light';

    setThemeMode(resolvedThemeMode);
    applyThemeModeService(resolvedThemeMode);
    setHasMounted(true);
  }, []);

  return (
    <button
      aria-label="Toggle light and dark mode"
      className="admin-nav-link w-full justify-between"
      onClick={toggleThemeMode}
      type="button"
    >
      <span className="inline-flex items-center gap-2">
        {hasMounted && themeMode === 'light' ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4" />
        )}
        <span>Theme</span>
      </span>
      <span className="text-xs font-medium text-ink-muted">
        {hasMounted ? (themeMode === 'light' ? 'Light' : 'Dark') : ''}
      </span>
    </button>
  );
}
