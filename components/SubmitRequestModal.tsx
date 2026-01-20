'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDemoMode } from '@/app/providers';
import { PREDEFINED_TAGS, FeatureRequestWithDetails } from '@/lib/types';
import { validateTitle, validateDescription, cn } from '@/lib/utils';
import { DuplicateDetectionModal } from './DuplicateDetectionModal';
import { DEMO_USER } from '@/lib/mockData';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest: FeatureRequestWithDetails) => void;
}

/**
 * Modal for submitting new feature requests
 * Includes AI-powered duplicate detection before submission
 * In demo mode, allows submission without authentication
 */
export function SubmitRequestModal({ isOpen, onClose, onSuccess }: SubmitRequestModalProps) {
  const { data: session } = useSession();
  const { isDemoMode } = useDemoMode();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<FeatureRequestWithDetails[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setCustomTag('');
    setErrors({});
    setDuplicates([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const validateForm = (): boolean => {
    const titleValidation = validateTitle(title);
    const descriptionValidation = validateDescription(description);

    setErrors({
      title: titleValidation.error,
      description: descriptionValidation.error,
    });

    return titleValidation.valid && descriptionValidation.valid;
  };

  const checkForDuplicates = async () => {
    if (!validateForm()) return;

    // Skip duplicate detection in demo mode (no API available)
    if (isDemoMode) {
      await submitRequest();
      return;
    }

    setIsCheckingDuplicates(true);
    try {
      const response = await fetch('/api/ai/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.duplicates && data.duplicates.length > 0) {
          setDuplicates(data.duplicates);
          setShowDuplicateModal(true);
        } else {
          await submitRequest();
        }
      } else {
        await submitRequest();
      }
    } catch (error) {
      console.error('Duplicate check failed:', error);
      await submitRequest();
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const submitRequest = async (mergeWithId?: string) => {
    setIsSubmitting(true);
    try {
      // In demo mode, create a mock request locally
      if (isDemoMode) {
        const now = new Date().toISOString();
        const newRequest: FeatureRequestWithDetails = {
          id: `demo-${Date.now()}`,
          title: title.trim(),
          description: description.trim(),
          summary: null,
          tags: selectedTags,
          status: 'under_review',
          upvotes: 1,
          commentCount: 0,
          hasVoted: true,
          createdAt: now,
          updatedAt: now,
          authorId: DEMO_USER.id,
          authorName: DEMO_USER.name,
          authorAvatar: DEMO_USER.image,
          mergedFromIds: [],
          mergedIntoId: mergeWithId || null,
          isPinned: false,
          adminNotes: null,
        };
        onSuccess(newRequest);
        handleClose();
        return;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags: selectedTags,
          mergeWithId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.request);
        handleClose();
      } else {
        const error = await response.json();
        console.error('Failed to submit:', error);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
      setShowDuplicateModal(false);
    }
  };

  if (!isOpen) return null;

  // Allow demo mode users OR authenticated users
  if (!session?.user && !isDemoMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="modal-overlay" onClick={handleClose} />
        <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4">
          <h2 className="text-xl font-semibold text-white mb-4">Sign in Required</h2>
          <p className="text-text-secondary mb-4">
            Please sign in to submit a feature request.
          </p>
          <button
            onClick={handleClose}
            className="w-full py-2 bg-card border border-border rounded-lg text-white hover:bg-card-hover"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
        <div className="modal-overlay" onClick={handleClose} />
        <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Submit Feature Request</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-card-hover rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Brief, descriptive title for your request"
                className={cn(
                  'w-full p-3 bg-background border rounded-lg text-white placeholder-text-muted',
                  'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.title ? 'border-red-500' : 'border-border'
                )}
              />
              <div className="flex justify-between mt-1">
                {errors.title && <p className="text-sm text-red-400">{errors.title}</p>}
                <p className="text-xs text-text-muted ml-auto">{title.length}/100</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-text-muted mb-2">
                Supports Markdown formatting. Be specific about the problem and proposed solution.
              </p>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="## Problem&#10;Describe the problem you're trying to solve...&#10;&#10;## Proposed Solution&#10;Describe your ideal solution..."
                className={cn(
                  'w-full p-3 bg-background border rounded-lg text-white placeholder-text-muted resize-none font-mono text-sm',
                  'focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.description ? 'border-red-500' : 'border-border'
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-400 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PREDEFINED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm border transition-colors',
                      selectedTags.includes(tag)
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                        : 'bg-background border-border text-text-secondary hover:border-purple-500/50'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom tag input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="Add custom tag"
                  className="flex-1 p-2 bg-background border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-3 py-2 bg-card border border-border rounded-lg text-text-secondary hover:bg-card-hover"
                >
                  Add
                </button>
              </div>

              {/* Selected custom tags */}
              {selectedTags.filter((t) => !PREDEFINED_TAGS.includes(t as (typeof PREDEFINED_TAGS)[number])).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags
                    .filter((t) => !PREDEFINED_TAGS.includes(t as (typeof PREDEFINED_TAGS)[number]))
                    .map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-500/20 border border-purple-500 text-purple-400"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-white"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-card border border-border rounded-lg text-white hover:bg-card-hover"
            >
              Cancel
            </button>
            <button
              onClick={checkForDuplicates}
              disabled={isSubmitting || isCheckingDuplicates}
              className="px-6 py-2 btn-primary text-white rounded-lg disabled:opacity-50"
            >
              {isCheckingDuplicates
                ? 'Checking for duplicates...'
                : isSubmitting
                ? 'Submitting...'
                : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Detection Modal */}
      <DuplicateDetectionModal
        isOpen={showDuplicateModal}
        duplicates={duplicates}
        onSubmitAnyway={() => submitRequest()}
        onMerge={(id) => submitRequest(id)}
        onCancel={() => setShowDuplicateModal(false)}
      />
    </>
  );
}
