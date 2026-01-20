'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useDemoMode } from '@/app/providers';
import { cn, formatVoteCount } from '@/lib/utils';

interface VoteButtonProps {
  requestId: string;
  initialVotes: number;
  initialHasVoted: boolean;
  onVoteChange?: (newCount: number, hasVoted: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * VoteButton component with optimistic UI updates
 * Allows users to upvote/downvote feature requests
 */
export function VoteButton({
  requestId,
  initialVotes,
  initialHasVoted,
  onVoteChange,
  size = 'md',
  className,
}: VoteButtonProps) {
  const { data: session } = useSession();
  const { isDemoMode } = useDemoMode();
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const canVote = isDemoMode || session?.user;

  const handleVote = useCallback(async () => {
    if (!canVote) return;
    if (isLoading) return;

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // Optimistic update
    const newHasVoted = !hasVoted;
    const newVotes = newHasVoted ? votes + 1 : votes - 1;

    setHasVoted(newHasVoted);
    setVotes(newVotes);
    onVoteChange?.(newVotes, newHasVoted);

    // In demo mode, just update locally
    if (isDemoMode) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/requests/${requestId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        // Revert on error
        setHasVoted(hasVoted);
        setVotes(votes);
        onVoteChange?.(votes, hasVoted);
        console.error('Vote failed');
      }
    } catch (error) {
      // Revert on error
      setHasVoted(hasVoted);
      setVotes(votes);
      onVoteChange?.(votes, hasVoted);
      console.error('Vote error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, votes, hasVoted, isLoading, canVote, isDemoMode, onVoteChange]);

  const sizeClasses = {
    sm: 'text-sm gap-1.5 px-2.5 py-1.5',
    md: 'text-base gap-2 px-3 py-2',
    lg: 'text-lg gap-2 px-4 py-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={handleVote}
      disabled={!canVote || isLoading}
      className={cn(
        'vote-button inline-flex items-center rounded-lg font-medium',
        'border border-border bg-card',
        'transition-all duration-200 ease-out',
        'hover:border-purple-500/40 hover:bg-purple-500/5',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border',
        sizeClasses[size],
        hasVoted && 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/15',
        isAnimating && 'scale-105',
        className
      )}
      aria-label={hasVoted ? 'Remove vote' : 'Upvote'}
      aria-pressed={hasVoted}
    >
      {/* Clean upvote triangle arrow */}
      <svg
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          hasVoted ? 'text-purple-500' : 'text-text-secondary',
          isAnimating && hasVoted && '-translate-y-0.5'
        )}
        viewBox="0 0 16 16"
        fill={hasVoted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={hasVoted ? 0 : 1.5}
      >
        <path
          d="M8 3L14 11H2L8 3Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={cn(
          'tabular-nums font-semibold transition-all duration-200',
          hasVoted ? 'text-purple-500' : 'text-text-secondary',
          isAnimating && 'scale-110'
        )}
      >
        {formatVoteCount(votes)}
      </span>
    </button>
  );
}
