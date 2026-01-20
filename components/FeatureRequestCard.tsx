'use client';

import { FeatureRequestWithDetails } from '@/lib/types';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { VoteButton } from './VoteButton';
import { Avatar } from './Avatar';

interface FeatureRequestCardProps {
  request: FeatureRequestWithDetails;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * FeatureRequestCard displays a summary of a feature request in the sidebar
 * Shows title, status, author, vote count, and comment count
 */
export function FeatureRequestCard({
  request,
  isSelected,
  onClick,
}: FeatureRequestCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group p-4 border-b border-border cursor-pointer',
        'transition-all duration-150 ease-out',
        'hover:bg-card-hover/50',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset',
        isSelected
          ? 'bg-card-hover border-l-2 border-l-purple-500'
          : 'border-l-2 border-l-transparent hover:border-l-purple-500/30'
      )}
      aria-selected={isSelected}
      aria-label={`Feature request: ${request.title}`}
    >
      {/* Header with avatar, author, and timestamp */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar name={request.authorName} image={request.authorAvatar} size="sm" />
        <span className="text-sm text-text-secondary truncate flex-1">
          {request.authorName}
        </span>
        <span className="text-xs text-text-muted flex-shrink-0">
          {formatRelativeTime(request.createdAt)}
        </span>
      </div>

      {/* Title and pinned indicator */}
      <div className="flex items-start gap-2 mb-2">
        {request.isPinned && (
          <svg
            className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <h3 className="text-white font-medium line-clamp-2 flex-1">
          {request.title}
        </h3>
      </div>

      {/* Status badge */}
      <div className="mb-2">
        <StatusBadge status={request.status} />
      </div>

      {/* Description preview */}
      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
        {truncate(request.description.replace(/[#*`]/g, ''), 120)}
      </p>

      {/* Tags */}
      {request.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {request.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
          {request.tags.length > 3 && (
            <span className="tag-pill">+{request.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Merged indicator */}
      {request.mergedFromIds.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <svg
            className="w-4 h-4 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <span className="text-xs text-purple-400">
            Merged from {request.mergedFromIds.length} request
            {request.mergedFromIds.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Footer with votes and comments */}
      <div className="flex items-center justify-between">
        <div onClick={(e) => e.stopPropagation()}>
          <VoteButton
            requestId={request.id}
            initialVotes={request.upvotes}
            initialHasVoted={request.hasVoted || false}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1.5 text-text-muted px-2.5 py-1.5 rounded-lg bg-card border border-border">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm tabular-nums font-medium">{request.commentCount}</span>
        </div>
      </div>
    </article>
  );
}
