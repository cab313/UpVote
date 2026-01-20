'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { FeatureRequestWithDetails, CommentWithReplies } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { VoteButton } from './VoteButton';
import { Avatar } from './Avatar';
import { CommentThread } from './CommentThread';

interface FeatureRequestDetailProps {
  request: FeatureRequestWithDetails;
  onClose?: () => void;
}

/**
 * FeatureRequestDetail shows the full details of a feature request
 * Including description, comments, voting, and admin actions
 */
export function FeatureRequestDetail({ request, onClose }: FeatureRequestDetailProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/requests/${request.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [request.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border pb-4 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Mobile back button */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden flex items-center gap-1 text-text-secondary hover:text-white mb-3"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to list
              </button>
            )}

            <div className="flex items-center gap-2 mb-2">
              {request.isPinned && (
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.5 3A2.5 2.5 0 003 5.5v2.879a2.5 2.5 0 00.732 1.767l6.5 6.5a2.5 2.5 0 003.536 0l2.878-2.878a2.5 2.5 0 000-3.536l-6.5-6.5A2.5 2.5 0 008.38 3H5.5zM6 7a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <h1 className="text-2xl font-bold text-white">{request.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={request.status} />
              <div className="flex items-center gap-2">
                <Avatar name={request.authorName} image={request.authorAvatar} size="sm" />
                <span className="text-sm text-text-secondary">{request.authorName}</span>
              </div>
              <span className="text-sm text-text-muted">
                {formatRelativeTime(request.createdAt)}
              </span>
            </div>
          </div>

          <VoteButton
            requestId={request.id}
            initialVotes={request.upvotes}
            initialHasVoted={request.hasVoted || false}
            size="lg"
          />
        </div>

        {/* Tags */}
        {request.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {request.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Merged badge */}
        {request.mergedFromIds.length > 0 && (
          <div className="flex items-center gap-2 mt-4 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span className="text-sm text-purple-400">
              This request was merged from {request.mergedFromIds.length} duplicate submission
              {request.mergedFromIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* AI Summary */}
        {request.summary && (
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-sm font-medium text-purple-400">AI Summary</span>
            </div>
            <p className="text-text-secondary">{request.summary}</p>
          </div>
        )}

        {/* Description */}
        <div className="prose prose-invert max-w-none">
          <div className="markdown-content text-text-secondary">
            <ReactMarkdown>{request.description}</ReactMarkdown>
          </div>
        </div>

        {/* Admin notes (only visible to admins) */}
        {session?.user?.isAdmin && request.adminNotes && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm font-medium text-amber-400">Admin Notes</span>
            </div>
            <p className="text-amber-200">{request.adminNotes}</p>
          </div>
        )}

        {/* Comments section */}
        <div className="border-t border-border pt-6">
          {isLoadingComments ? (
            <div className="space-y-4">
              <div className="h-6 w-24 skeleton rounded" />
              <div className="h-20 skeleton rounded-lg" />
            </div>
          ) : (
            <CommentThread
              comments={comments}
              requestId={request.id}
              onCommentAdded={fetchComments}
            />
          )}
        </div>
      </div>
    </div>
  );
}
