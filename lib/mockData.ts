// =============================================================================
// Mock Data for Demo Mode
// =============================================================================
// This file provides sample data to test the UI without a database or auth
// Enable demo mode by setting NEXT_PUBLIC_DEMO_MODE=true in .env.local
// =============================================================================

import { FeatureRequestWithMeta, CommentWithReplies } from './types';

// Demo user - simulates being logged in as an admin
export const DEMO_USER = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@meta.com',
  image: null,
  isAdmin: true,
};

// Sample feature requests
export const MOCK_REQUESTS: FeatureRequestWithMeta[] = [
  {
    id: 'req-1',
    title: 'Dark mode for mobile app',
    description: `## Problem
The mobile app currently only has a light theme, which can be harsh on the eyes in low-light environments.

## Proposed Solution
Add a dark mode toggle in the app settings that switches to a dark color scheme. This should:
- Use OLED-friendly true black backgrounds where possible
- Sync with system preferences automatically
- Remember user preference across sessions

## Benefits
- Reduced eye strain
- Better battery life on OLED devices
- Accessibility improvement`,
    summary: 'Users want a dark mode option for the mobile app to reduce eye strain and save battery on OLED screens.',
    status: 'planned',
    authorId: 'user-1',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://i.pravatar.cc/150?u=sarah',
    tags: ['Mobile', 'UI/UX', 'Accessibility'],
    upvotes: 142,
    commentCount: 23,
    isPinned: true,
    adminNotes: 'Scheduled for Q2 release. Design mockups approved.',
    mergedFromIds: [],
    mergedIntoId: null,
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-20T14:00:00Z').toISOString(),
    hasVoted: true,
  },
  {
    id: 'req-2',
    title: 'API rate limiting dashboard',
    description: `## Problem
Currently there's no visibility into API rate limiting. Developers hit rate limits unexpectedly and have no way to monitor their usage.

## Proposed Solution
Create a dashboard showing:
- Current API usage vs limits
- Historical usage graphs
- Alerts when approaching limits
- Request breakdown by endpoint

## Technical Notes
This would require adding usage tracking middleware and a new analytics endpoint.`,
    summary: 'Request for a dashboard to monitor API rate limits and usage patterns in real-time.',
    status: 'in_progress',
    authorId: 'user-2',
    authorName: 'Marcus Johnson',
    authorAvatar: 'https://i.pravatar.cc/150?u=marcus',
    tags: ['API', 'Documentation', 'Performance'],
    upvotes: 89,
    commentCount: 15,
    isPinned: false,
    adminNotes: 'Engineering team started implementation. ETA: 3 weeks.',
    mergedFromIds: [],
    mergedIntoId: null,
    createdAt: new Date('2024-01-10T08:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-18T16:30:00Z').toISOString(),
    hasVoted: false,
  },
  {
    id: 'req-3',
    title: 'Keyboard shortcuts for power users',
    description: `## Problem
Power users who work with the platform daily would benefit from keyboard shortcuts to speed up common actions.

## Proposed Shortcuts
- \`/\` - Focus search
- \`n\` - New request
- \`j/k\` - Navigate up/down
- \`v\` - Vote/unvote
- \`c\` - Open comments
- \`?\` - Show shortcut help

## Prior Art
Similar to GitHub, Notion, and Linear keyboard shortcuts.`,
    summary: 'Add keyboard shortcuts for common actions to improve productivity for power users.',
    status: 'under_review',
    authorId: 'user-3',
    authorName: 'Emily Watson',
    authorAvatar: 'https://i.pravatar.cc/150?u=emily',
    tags: ['UI/UX', 'Accessibility'],
    upvotes: 67,
    commentCount: 8,
    isPinned: false,
    adminNotes: null,
    mergedFromIds: [],
    mergedIntoId: null,
    createdAt: new Date('2024-01-18T14:20:00Z').toISOString(),
    updatedAt: new Date('2024-01-18T14:20:00Z').toISOString(),
    hasVoted: false,
  },
  {
    id: 'req-4',
    title: 'Two-factor authentication support',
    description: `## Problem
The platform currently only supports password authentication, which is less secure.

## Proposed Solution
Add support for:
- TOTP authenticator apps (Google Authenticator, Authy, etc.)
- SMS backup codes
- Hardware security keys (WebAuthn)

## Security Considerations
This is critical for enterprise customers who require 2FA compliance.`,
    summary: 'Add two-factor authentication options including authenticator apps and hardware keys.',
    status: 'implemented',
    authorId: 'user-4',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://i.pravatar.cc/150?u=alex',
    tags: ['Security', 'API'],
    upvotes: 234,
    commentCount: 42,
    isPinned: false,
    adminNotes: 'Shipped in v2.4.0. Blog post published.',
    mergedFromIds: ['req-old-1', 'req-old-2'],
    mergedIntoId: null,
    createdAt: new Date('2023-11-05T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-12T11:00:00Z').toISOString(),
    hasVoted: true,
  },
  {
    id: 'req-5',
    title: 'Bulk export of analytics data',
    description: `## Problem
Exporting analytics data is limited to the UI, which is slow for large datasets.

## Proposed Solution
Add a bulk export feature that:
- Supports CSV, JSON, and Parquet formats
- Allows date range selection
- Runs async with email notification when complete
- Provides download links valid for 24 hours`,
    summary: 'Enable bulk export of analytics data in multiple formats for large datasets.',
    status: 'under_review',
    authorId: 'user-5',
    authorName: 'Jordan Kim',
    authorAvatar: 'https://i.pravatar.cc/150?u=jordan',
    tags: ['API', 'Performance', 'Integration'],
    upvotes: 45,
    commentCount: 6,
    isPinned: false,
    adminNotes: null,
    mergedFromIds: [],
    mergedIntoId: null,
    createdAt: new Date('2024-01-19T16:45:00Z').toISOString(),
    updatedAt: new Date('2024-01-19T16:45:00Z').toISOString(),
    hasVoted: false,
  },
  {
    id: 'req-6',
    title: 'Improved error messages',
    description: `## Problem
Current error messages are generic and unhelpful. Users often don't know what went wrong or how to fix it.

## Examples of Bad Errors
- "An error occurred" (no context)
- "Invalid input" (which input?)
- "Request failed" (why?)

## Proposed Solution
Each error should include:
- Clear description of what went wrong
- Suggested fix or next steps
- Error code for support reference
- Link to relevant documentation`,
    summary: 'Improve error messages to be more descriptive and actionable for users.',
    status: 'planned',
    authorId: 'user-6',
    authorName: 'Taylor Swift',
    authorAvatar: 'https://i.pravatar.cc/150?u=taylor',
    tags: ['UI/UX', 'Documentation'],
    upvotes: 78,
    commentCount: 12,
    isPinned: false,
    adminNotes: 'UX team working on error message guidelines.',
    mergedFromIds: [],
    mergedIntoId: null,
    createdAt: new Date('2024-01-08T11:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-16T09:00:00Z').toISOString(),
    hasVoted: true,
  },
  {
    id: 'req-7',
    title: 'Webhook retry mechanism',
    description: `## Problem
When webhook deliveries fail, there's no automatic retry. Users have to manually re-trigger events.

## Proposed Solution
Implement exponential backoff retry:
- Retry up to 5 times
- Delays: 1min, 5min, 30min, 2hr, 12hr
- Show retry status in webhook logs
- Allow manual retry from UI`,
    summary: 'Add automatic retry with exponential backoff for failed webhook deliveries.',
    status: 'declined',
    authorId: 'user-7',
    authorName: 'Chris Lee',
    authorAvatar: 'https://i.pravatar.cc/150?u=chris',
    tags: ['API', 'Integration'],
    upvotes: 23,
    commentCount: 18,
    isPinned: false,
    adminNotes: 'Declined: Already implemented in v2.3. User was on outdated version.',
    mergedFromIds: [],
    mergedIntoId: null,
    createdAt: new Date('2024-01-05T13:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-07T10:00:00Z').toISOString(),
    hasVoted: false,
  },
];

// Sample comments for the first request
export const MOCK_COMMENTS: CommentWithReplies[] = [
  {
    id: 'comment-1',
    content: 'This would be amazing! I use the app mostly at night and the bright theme is really harsh. Would love to see this prioritized.',
    authorId: 'user-8',
    authorName: 'Mike Brown',
    authorAvatar: 'https://i.pravatar.cc/150?u=mike',
    requestId: 'req-1',
    parentId: null,
    createdAt: new Date('2024-01-15T12:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T12:00:00Z').toISOString(),
    replies: [
      {
        id: 'comment-2',
        content: 'Agreed! Also hoping it syncs with system dark mode automatically.',
        authorId: 'user-9',
        authorName: 'Lisa Park',
        authorAvatar: 'https://i.pravatar.cc/150?u=lisa',
        requestId: 'req-1',
        parentId: 'comment-1',
        createdAt: new Date('2024-01-15T14:30:00Z').toISOString(),
        updatedAt: new Date('2024-01-15T14:30:00Z').toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'comment-3',
    content: "We're actively working on this! The design team has finalized the dark theme palette. Expect it in the next major release.",
    authorId: 'demo-user-1',
    authorName: 'Demo User',
    authorAvatar: null,
    requestId: 'req-1',
    parentId: null,
    createdAt: new Date('2024-01-16T09:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-16T09:00:00Z').toISOString(),
    replies: [
      {
        id: 'comment-4',
        content: "That's great news! Any ETA on the release?",
        authorId: 'user-8',
        authorName: 'Mike Brown',
        authorAvatar: 'https://i.pravatar.cc/150?u=mike',
        requestId: 'req-1',
        parentId: 'comment-3',
        createdAt: new Date('2024-01-16T10:15:00Z').toISOString(),
        updatedAt: new Date('2024-01-16T10:15:00Z').toISOString(),
        replies: [],
      },
    ],
  },
  {
    id: 'comment-5',
    content: 'Please make sure to support AMOLED black, not just dark gray. True black saves battery on OLED screens!',
    authorId: 'user-10',
    authorName: 'David Chen',
    authorAvatar: 'https://i.pravatar.cc/150?u=david',
    requestId: 'req-1',
    parentId: null,
    createdAt: new Date('2024-01-17T08:45:00Z').toISOString(),
    updatedAt: new Date('2024-01-17T08:45:00Z').toISOString(),
    replies: [],
  },
];

// Check if demo mode is enabled
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

// Get mock requests with optional filtering
export function getMockRequests(options?: {
  search?: string;
  status?: string;
  sort?: string;
}): FeatureRequestWithMeta[] {
  let results = [...MOCK_REQUESTS];

  // Filter by search
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
    );
  }

  // Filter by status
  if (options?.status && options.status !== 'all') {
    results = results.filter((r) => r.status === options.status);
  }

  // Sort
  switch (options?.sort) {
    case 'newest':
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'most_voted':
      results.sort((a, b) => b.upvotes - a.upvotes);
      break;
    case 'trending':
    default:
      // Trending: weighted by recency and votes
      results.sort((a, b) => {
        const aScore = a.upvotes + (a.isPinned ? 1000 : 0);
        const bScore = b.upvotes + (b.isPinned ? 1000 : 0);
        return bScore - aScore;
      });
  }

  return results;
}

// Get mock comments for a request
export function getMockComments(requestId: string): CommentWithReplies[] {
  if (requestId === 'req-1') {
    return MOCK_COMMENTS;
  }
  return [];
}
