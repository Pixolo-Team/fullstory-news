'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdminDemoContext } from '@/components/admin-demo-provider';
import {
  CloseIcon,
  GridIcon,
  LayersIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  StoryIcon,
} from '@/components/admin-icons';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardSidebarProps {
  className?: string;
}

const NAVIGATION_GROUPS = [
  {
    heading: 'Menu',
    items: [
      { href: '/', label: 'Dashboard', icon: GridIcon },
      { href: '/stories', label: 'Stories', icon: StoryIcon },
      { href: '/stories/new', label: 'New Story', icon: PlusIcon },
      { href: '/categories', label: 'Categories', icon: LayersIcon },
    ],
  },
] as const;

/**
 * Renders the admin sidebar with navigation, theme controls, and logout action.
 */
export function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  // Define Navigation
  const pathname = usePathname();
  const router = useRouter();

  // Define Context
  const { signOut } = useAdminDemoContext();

  // Define Refs

  // Define States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Helper Functions
  /**
   * Returns whether the given link should be highlighted as active.
   */
  const getIsActiveRoute = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /**
   * Toggles the mobile sidebar open state.
   */
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((currentState) => !currentState);
  };

  /**
   * Closes the mobile sidebar after a navigation action.
   */
  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Signs out of the local dummy admin and returns to login.
   */
  const handleLogout = (): void => {
    signOut();
    closeMobileMenu();
    router.push('/login');
  };

  // Use Effects
  return (
    <aside
      className={`admin-sidebar border-b border-rule px-4 py-4 sm:px-5 sm:py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-6 lg:py-6 ${className}`.trim()}
    >
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <div className="space-y-1">
          <div className="inline-flex rounded-full border border-rule bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
            Full Story
          </div>
          <p className="text-lg font-semibold tracking-tight text-ink">Admin Panel</p>
        </div>

        <button
          className="admin-nav-link w-auto px-4"
          onClick={toggleMobileMenu}
          type="button"
        >
          {isMobileMenuOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          <span>Menu</span>
        </button>
      </div>

      <div className={`${isMobileMenuOpen ? 'mt-4 block' : 'hidden'} lg:mt-0 lg:block`}>
        <div className="flex h-full flex-col">
          <div className="space-y-4 lg:space-y-5">
            <div className="hidden space-y-3 lg:block">
              <div className="inline-flex rounded-full border border-rule bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-muted">
                Full Story
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-ink">Admin Panel</h1>
                <p className="text-sm leading-6 text-ink-muted">
                  A cleaner editorial workspace for managing Stories, drafts, and Categories.
                </p>
              </div>
            </div>

            {NAVIGATION_GROUPS.map((group) => (
              <nav className="flex flex-col gap-1" key={group.heading}>
                {group.items.map((item) => {
                  const isActive = getIsActiveRoute(item.href);
                  const IconComponent = item.icon;

                  return (
                    <Link
                      aria-current={isActive ? 'page' : undefined}
                      className={`admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`.trim()}
                      href={item.href}
                      key={item.href}
                      onClick={closeMobileMenu}
                    >
                      <IconComponent className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-1 border-t border-rule pt-4 lg:mt-auto">
            <ThemeToggle />

            <button className="admin-nav-link w-full" onClick={handleLogout} type="button">
              <LogoutIcon className="h-5 w-5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
