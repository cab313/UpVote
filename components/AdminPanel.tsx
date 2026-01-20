'use client';

import { useState } from 'react';
import { FeatureRequestWithDetails, FeatureRequestStatus, STATUS_CONFIG } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface AdminPanelProps {
  request: FeatureRequestWithDetails;
  onUpdate: () => void;
}

/**
 * AdminPanel provides admin controls for managing feature requests
 * Only visible to users with @meta.com or @fb.com email domains
 */
export function AdminPanel({ request, onUpdate }: AdminPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState<FeatureRequestStatus>(request.status);
  const [isPinned, setIsPinned] = useState(request.isPinned);
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isPinned, adminNotes }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this feature request? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete request:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerateSummary = async () => {
    try {
      const response = await fetch(`/api/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          title: request.title,
          description: request.description,
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to regenerate summary:', error);
    }
  };

  const statusOptions = Object.keys(STATUS_CONFIG) as FeatureRequestStatus[];

  return (
    <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="font-medium text-amber-400">Admin Controls</span>
        </div>
        <svg
          className={cn(
            'w-5 h-5 text-amber-400 transition-transform',
            isExpanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 border-t border-amber-500/30 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-amber-400 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    status === s
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-border bg-card hover:bg-card-hover'
                  )}
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </div>
          </div>

          {/* Pin toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-border bg-card text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-white">Pin this request (shows at top)</span>
            </label>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-sm font-medium text-amber-400 mb-2">
              Admin Notes (internal only)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes visible only to admins..."
              className="w-full p-3 bg-card border border-border rounded-lg text-white resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>

            <button
              onClick={handleRegenerateSummary}
              className="px-4 py-2 bg-card border border-border rounded-lg text-white hover:bg-card-hover transition-colors"
            >
              Regenerate AI Summary
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
