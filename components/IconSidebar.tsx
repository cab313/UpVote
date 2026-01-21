'use client';

import Link from 'next/link';
import { Avatar } from './Avatar';

interface IconSidebarProps {
  currentUser?: {
    name?: string | null;
    image?: string | null;
  } | null;
  isAdmin?: boolean;
  isDemoMode?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

/**
 * Slim icon sidebar matching the reference design
 * Shows navigation icons and user avatar
 */
export function IconSidebar({
  currentUser,
  isAdmin,
  isDemoMode,
  onSignIn,
  onSignOut,
}: IconSidebarProps) {
  return (
    <aside className="w-12 flex-shrink-0 bg-background border-r border-border flex flex-col items-center py-4 gap-2">
      {/* Logo / Grid icon */}
      <button className="w-8 h-8 rounded-lg hover:bg-card flex items-center justify-center transition-colors">
        <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>

      {/* Requests - Active */}
      <button className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center transition-colors">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Settings / Admin */}
      {isAdmin && (
        <Link
          href="/admin"
          className="w-8 h-8 rounded-lg hover:bg-card flex items-center justify-center transition-colors"
          title="Admin Settings"
        >
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      )}

      {/* User Avatar */}
      {currentUser ? (
        <button
          onClick={() => !isDemoMode && onSignOut?.()}
          className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-accent/50 transition-all"
          title={isDemoMode ? 'Demo User' : 'Sign out'}
        >
          <Avatar name={currentUser.name || 'User'} image={currentUser.image} size="md" />
        </button>
      ) : (
        <button
          onClick={onSignIn}
          className="w-8 h-8 rounded-lg hover:bg-card flex items-center justify-center transition-colors"
          title="Sign in"
        >
          <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      )}
    </aside>
  );
}
