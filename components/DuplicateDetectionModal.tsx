'use client';

import { FeatureRequestWithDetails } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

interface DuplicateDetectionModalProps {
  isOpen: boolean;
  duplicates: FeatureRequestWithDetails[];
  onSubmitAnyway: () => void;
  onMerge: (requestId: string) => void;
  onCancel: () => void;
}

/**
 * Modal shown when potential duplicate requests are detected
 * Gives user options to submit anyway, merge, or cancel
 */
export function DuplicateDetectionModal({
  isOpen,
  duplicates,
  onSubmitAnyway,
  onMerge,
  onCancel,
}: DuplicateDetectionModalProps) {
  if (!isOpen || duplicates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto py-4">
      <div className="modal-overlay" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Similar Requests Found</h2>
              <p className="text-sm text-text-secondary">
                We found {duplicates.length} similar request{duplicates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-text-secondary text-sm">
            Your request may already exist. You can vote for an existing request instead, or merge
            your submission with one to combine votes.
          </p>

          {/* Duplicate list */}
          <div className="space-y-3">
            {duplicates.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-background border border-border rounded-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-white">{request.title}</h3>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {request.description.replace(/[#*`]/g, '').substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      {request.upvotes} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {request.commentCount} comments
                    </span>
                  </div>
                  <button
                    onClick={() => onMerge(request.id)}
                    className="px-3 py-1.5 text-sm bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Merge with this
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-white hover:bg-card-hover"
          >
            Cancel
          </button>
          <button
            onClick={onSubmitAnyway}
            className="flex-1 px-4 py-2 btn-primary text-white rounded-lg"
          >
            Submit Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
