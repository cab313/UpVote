// =============================================================================
// Shared Types for Feature Request Portal
// =============================================================================
// These types are used across client and server components
// =============================================================================

// Define our own FeatureRequestStatus type that matches Prisma enum
// This allows the types to work in demo mode without requiring Prisma
export type FeatureRequestStatus =
  | 'under_review'
  | 'planned'
  | 'in_progress'
  | 'implemented'
  | 'declined';

/**
 * Feature request as returned from the API with all related data
 */
export interface FeatureRequestWithDetails {
  id: string;
  title: string;
  description: string;
  summary: string | null;
  status: FeatureRequestStatus;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  tags: string[];
  upvotes: number;
  commentCount: number;
  mergedFromIds: string[];
  mergedIntoId: string | null;
  isPinned: boolean;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  hasVoted?: boolean;
}

// Alias for backwards compatibility
export type FeatureRequestWithMeta = FeatureRequestWithDetails;

/**
 * Comment with author info and replies
 */
export interface CommentWithReplies {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  requestId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: CommentWithReplies[];
}

/**
 * Sort options for feature request list
 */
export type SortOption = 'trending' | 'most_voted' | 'newest' | 'oldest';

/**
 * Status display info including colors and labels
 */
export const STATUS_CONFIG: Record<FeatureRequestStatus, { label: string; color: string; bgColor: string }> = {
  under_review: {
    label: 'Under Review',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
  },
  planned: {
    label: 'Planned',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/30',
  },
  implemented: {
    label: 'Implemented',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
  },
  declined: {
    label: 'Declined',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/30',
  },
};

/**
 * Predefined tags for feature requests
 */
export const PREDEFINED_TAGS = [
  'UI/UX',
  'Performance',
  'API',
  'Documentation',
  'Mobile',
  'Integration',
  'Security',
  'Accessibility',
] as const;

export type PredefinedTag = typeof PREDEFINED_TAGS[number];

/**
 * Input for creating a new feature request
 */
export interface CreateFeatureRequestInput {
  title: string;
  description: string;
  tags: string[];
}

/**
 * Input for creating a new comment
 */
export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

/**
 * Response from duplicate detection API
 */
export interface DuplicateDetectionResponse {
  duplicates: Array<{
    id: string;
    title: string;
    similarity: number;
  }>;
}

/**
 * Admin action for updating a feature request
 */
export interface AdminUpdateInput {
  status?: FeatureRequestStatus;
  isPinned?: boolean;
  adminNotes?: string;
}
