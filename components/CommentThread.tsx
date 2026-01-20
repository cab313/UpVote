'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CommentWithReplies } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { Avatar } from './Avatar';

interface CommentThreadProps {
  comments: CommentWithReplies[];
  requestId: string;
  onCommentAdded: () => void;
}

/**
 * CommentThread displays comments with two-level threading
 * Allows adding new comments and replies
 */
export function CommentThread({ comments, requestId, onCommentAdded }: CommentThreadProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmitComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim() || !session?.user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), parentId }),
      });

      if (response.ok) {
        if (parentId) {
          setReplyContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/requests/${requestId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const renderComment = (comment: CommentWithReplies, isReply = false) => {
    const isOwner = session?.user?.id === comment.authorId;
    const canDelete = isOwner || session?.user?.isAdmin;
    const isEditing = editingId === comment.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-10 border-l-2 border-border pl-4' : ''}`}
      >
        <div className="flex gap-3 py-3">
          <Avatar name={comment.authorName} image={comment.authorAvatar} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{comment.authorName}</span>
              <span className="text-xs text-text-muted">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.createdAt !== comment.updatedAt && (
                <span className="text-xs text-text-muted">(edited)</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 bg-card border border-border rounded-lg text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditComment(comment.id)}
                    disabled={isSubmitting}
                    className="px-3 py-1 text-sm btn-primary text-white rounded-lg disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 text-sm bg-card border border-border rounded-lg text-text-secondary hover:bg-card-hover"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-text-secondary whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  {session?.user && !isReply && (
                    <button
                      onClick={() => {
                        setReplyingTo(comment.id);
                        setReplyContent('');
                      }}
                      className="text-xs text-text-muted hover:text-purple-400"
                    >
                      Reply
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-xs text-text-muted hover:text-purple-400"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-text-muted hover:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="ml-10 border-l-2 border-border pl-4 py-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 bg-card border border-border rounded-lg text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleSubmitComment(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
                className="px-3 py-1 text-sm btn-primary text-white rounded-lg disabled:opacity-50"
              >
                Reply
              </button>
              <button
                onClick={() => setReplyingTo(null)}
                className="px-3 py-1 text-sm bg-card border border-border rounded-lg text-text-secondary hover:bg-card-hover"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Render replies */}
        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Comments</h3>

      {/* New comment form */}
      {session?.user ? (
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 bg-card border border-border rounded-lg text-white resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSubmitComment()}
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 btn-primary text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-text-muted text-sm p-4 bg-card rounded-lg border border-border">
          Sign in to leave a comment
        </p>
      )}

      {/* Comments list */}
      <div className="divide-y divide-border">
        {comments.length === 0 ? (
          <p className="text-text-muted text-sm py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
