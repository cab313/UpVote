// =============================================================================
// Database Seed Script
// =============================================================================
// Populates the database with sample data for development and testing
// Run with: npm run seed
// =============================================================================

import { PrismaClient, FeatureRequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Predefined tags matching the spec
const TAGS = [
  'UI/UX',
  'Performance',
  'API',
  'Documentation',
  'Mobile',
  'Integration',
  'Security',
  'Accessibility',
];

// Sample users - 1 admin, 3 regular users
const users = [
  {
    id: 'user-admin-meta',
    name: 'Alex Chen',
    email: 'alex.chen@meta.com',
    image: null,
    isAdmin: true,
  },
  {
    id: 'user-regular-1',
    name: 'Jordan Smith',
    email: 'jordan.smith@gmail.com',
    image: null,
    isAdmin: false,
  },
  {
    id: 'user-regular-2',
    name: 'Taylor Johnson',
    email: 'taylor.j@company.com',
    image: null,
    isAdmin: false,
  },
  {
    id: 'user-regular-3',
    name: 'Morgan Lee',
    email: 'morgan.lee@startup.io',
    image: null,
    isAdmin: false,
  },
];

// Sample feature requests
const featureRequests = [
  {
    id: 'req-1',
    title: 'Dark mode for the dashboard',
    description: `## Problem
The current light theme causes eye strain during extended use, especially in low-light environments.

## Proposed Solution
Implement a comprehensive dark mode theme with:
- Toggle in settings or navbar
- Respect system preferences
- Smooth transition animation
- Consistent dark palette across all components

## Additional Context
Many enterprise tools now support dark mode as a standard feature. This would improve user comfort and accessibility.`,
    summary: 'Users want a dark mode option for the dashboard to reduce eye strain and improve usability in low-light environments.',
    status: 'in_progress' as FeatureRequestStatus,
    authorId: 'user-regular-1',
    authorName: 'Jordan Smith',
    tags: ['UI/UX', 'Accessibility'],
    upvotes: 42,
    isPinned: true,
    adminNotes: 'High priority - design team is working on this. ETA: Q2 2024',
    createdAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: 'req-2',
    title: 'API rate limiting dashboard',
    description: `## Feature Request
I'd like to see a real-time dashboard showing my API usage and rate limits.

## Details
- Current usage vs. limit visualization
- Historical usage charts
- Alerts when approaching limits
- Breakdown by endpoint

This would help us plan our API usage better and avoid hitting limits unexpectedly.`,
    summary: 'Request for a dashboard to visualize API rate limits and usage in real-time with alerts.',
    status: 'planned' as FeatureRequestStatus,
    authorId: 'user-regular-2',
    authorName: 'Taylor Johnson',
    tags: ['API', 'UI/UX'],
    upvotes: 28,
    isPinned: false,
    createdAt: new Date('2024-01-20T14:15:00Z'),
  },
  {
    id: 'req-3',
    title: 'Mobile app push notifications',
    description: `## Request
Enable push notifications in the mobile app for:
- New messages
- Status changes
- Mentions
- Custom alerts

## Why
Currently we have to keep checking the app. Push notifications would make the mobile experience much more useful.`,
    summary: 'Enable push notifications on mobile app for messages, status changes, and mentions.',
    status: 'under_review' as FeatureRequestStatus,
    authorId: 'user-regular-3',
    authorName: 'Morgan Lee',
    tags: ['Mobile', 'Integration'],
    upvotes: 35,
    isPinned: false,
    createdAt: new Date('2024-01-22T09:00:00Z'),
  },
  {
    id: 'req-4',
    title: 'Bulk export data to CSV',
    description: `## Problem
Currently, we can only export data one record at a time. For reporting purposes, we need bulk export functionality.

## Requested Features
- Select multiple records for export
- Export all with filters applied
- CSV and Excel formats
- Schedule recurring exports

This is critical for our monthly reporting workflow.`,
    summary: 'Add bulk data export functionality with CSV/Excel support and scheduled exports for reporting.',
    status: 'implemented' as FeatureRequestStatus,
    authorId: 'user-regular-1',
    authorName: 'Jordan Smith',
    tags: ['API', 'Integration'],
    upvotes: 56,
    isPinned: false,
    adminNotes: 'Shipped in v2.3.0',
    createdAt: new Date('2023-12-10T16:45:00Z'),
  },
  {
    id: 'req-5',
    title: 'Two-factor authentication options',
    description: `## Security Enhancement Request
Please add more 2FA options beyond SMS:
- TOTP apps (Google Authenticator, Authy)
- Hardware keys (YubiKey, FIDO2)
- Backup codes

SMS-only 2FA is considered less secure and some organizations require hardware key support.`,
    summary: 'Expand 2FA options to include TOTP apps and hardware security keys beyond just SMS.',
    status: 'in_progress' as FeatureRequestStatus,
    authorId: 'user-regular-2',
    authorName: 'Taylor Johnson',
    tags: ['Security', 'Integration'],
    upvotes: 67,
    isPinned: true,
    adminNotes: 'Security team prioritizing this. TOTP support coming first.',
    createdAt: new Date('2024-01-05T11:20:00Z'),
  },
  {
    id: 'req-6',
    title: 'Improved documentation search',
    description: `## Issue
The current documentation search is slow and doesn't return relevant results.

## Suggestions
- Full-text search across all docs
- Search suggestions/autocomplete
- Filter by category, date, tags
- Better ranking of results

Finding relevant docs is currently very frustrating.`,
    summary: 'Improve documentation search with full-text search, autocomplete, filtering, and better result ranking.',
    status: 'under_review' as FeatureRequestStatus,
    authorId: 'user-regular-3',
    authorName: 'Morgan Lee',
    tags: ['Documentation', 'UI/UX', 'Performance'],
    upvotes: 23,
    isPinned: false,
    createdAt: new Date('2024-01-25T13:30:00Z'),
  },
  {
    id: 'req-7',
    title: 'Keyboard shortcuts for common actions',
    description: `## Request
Add keyboard shortcuts for power users:
- Navigation shortcuts
- Action shortcuts (save, submit, cancel)
- Search shortcut (Cmd/Ctrl + K)
- Help overlay showing all shortcuts

This would significantly speed up workflows for frequent users.`,
    summary: 'Add keyboard shortcuts for navigation and common actions to improve power user productivity.',
    status: 'planned' as FeatureRequestStatus,
    authorId: 'user-regular-1',
    authorName: 'Jordan Smith',
    tags: ['UI/UX', 'Accessibility'],
    upvotes: 19,
    isPinned: false,
    createdAt: new Date('2024-01-18T08:45:00Z'),
  },
  {
    id: 'req-8',
    title: 'Webhook integration for events',
    description: `## Feature Request
Allow us to configure webhooks for various events:
- Record created/updated/deleted
- Status changes
- User actions

## Use Case
We want to integrate with our internal tools and Slack for notifications. Currently no way to get real-time updates.`,
    summary: 'Add webhook support for events like record changes and status updates for external integrations.',
    status: 'declined' as FeatureRequestStatus,
    authorId: 'user-regular-2',
    authorName: 'Taylor Johnson',
    tags: ['API', 'Integration'],
    upvotes: 31,
    isPinned: false,
    adminNotes: 'Declined: We are implementing a more comprehensive event streaming solution instead. See roadmap.',
    createdAt: new Date('2024-01-12T15:00:00Z'),
  },
  {
    id: 'req-merged-example',
    title: 'Performance improvements for large datasets',
    description: `## Problem
The application becomes very slow when working with datasets over 10,000 records.

## Areas needing improvement
- Table rendering (use virtualization)
- Search/filter operations
- Bulk selection
- Export operations

## Expected Behavior
Smooth performance even with 100k+ records.`,
    summary: 'Improve performance for large datasets through virtualization and optimized operations. (Merged from 2 requests)',
    status: 'planned' as FeatureRequestStatus,
    authorId: 'user-regular-3',
    authorName: 'Morgan Lee',
    tags: ['Performance', 'UI/UX'],
    upvotes: 89,
    isPinned: false,
    mergedFromIds: ['req-merged-1', 'req-merged-2'],
    adminNotes: 'Merged duplicate requests. Combined vote count reflects original submissions.',
    createdAt: new Date('2024-01-08T10:00:00Z'),
  },
];

// Sample comments
const comments = [
  // Comments for req-1 (Dark mode)
  {
    id: 'comment-1-1',
    content: 'This would be amazing! I work late nights and the bright theme is really harsh on the eyes.',
    authorId: 'user-regular-2',
    authorName: 'Taylor Johnson',
    requestId: 'req-1',
    parentId: null,
    createdAt: new Date('2024-01-16T11:00:00Z'),
  },
  {
    id: 'comment-1-2',
    content: 'Agreed! Also, please make sure it syncs with system preferences for automatic switching.',
    authorId: 'user-regular-3',
    authorName: 'Morgan Lee',
    requestId: 'req-1',
    parentId: 'comment-1-1',
    createdAt: new Date('2024-01-16T14:30:00Z'),
  },
  {
    id: 'comment-1-3',
    content: "We're working on this! The design system is being updated to support both themes. Stay tuned.",
    authorId: 'user-admin-meta',
    authorName: 'Alex Chen',
    requestId: 'req-1',
    parentId: null,
    createdAt: new Date('2024-01-17T09:15:00Z'),
  },

  // Comments for req-3 (Push notifications)
  {
    id: 'comment-3-1',
    content: 'Please also add the ability to customize which notifications we receive!',
    authorId: 'user-regular-1',
    authorName: 'Jordan Smith',
    requestId: 'req-3',
    parentId: null,
    createdAt: new Date('2024-01-22T12:00:00Z'),
  },
  {
    id: 'comment-3-2',
    content: 'Yes, granular controls would be essential. Nobody wants to be spammed.',
    authorId: 'user-regular-2',
    authorName: 'Taylor Johnson',
    requestId: 'req-3',
    parentId: 'comment-3-1',
    createdAt: new Date('2024-01-22T15:45:00Z'),
  },

  // Comments for req-5 (2FA)
  {
    id: 'comment-5-1',
    content: 'Our security team requires hardware key support. This is blocking our enterprise adoption.',
    authorId: 'user-regular-3',
    authorName: 'Morgan Lee',
    requestId: 'req-5',
    parentId: null,
    createdAt: new Date('2024-01-06T10:00:00Z'),
  },
  {
    id: 'comment-5-2',
    content: 'TOTP support would cover 90% of our needs. Even that would be a huge improvement.',
    authorId: 'user-regular-1',
    authorName: 'Jordan Smith',
    requestId: 'req-5',
    parentId: null,
    createdAt: new Date('2024-01-07T16:20:00Z'),
  },
  {
    id: 'comment-5-3',
    content: "Update: TOTP support is now in beta testing. We'll roll it out to all users next month.",
    authorId: 'user-admin-meta',
    authorName: 'Alex Chen',
    requestId: 'req-5',
    parentId: null,
    createdAt: new Date('2024-01-20T11:00:00Z'),
  },
];

// Sample votes
const votes = [
  // Votes for req-1
  { userId: 'user-regular-2', requestId: 'req-1' },
  { userId: 'user-regular-3', requestId: 'req-1' },
  { userId: 'user-admin-meta', requestId: 'req-1' },
  // Votes for req-3
  { userId: 'user-regular-1', requestId: 'req-3' },
  { userId: 'user-regular-2', requestId: 'req-3' },
  // Votes for req-5
  { userId: 'user-regular-1', requestId: 'req-5' },
  { userId: 'user-regular-2', requestId: 'req-5' },
  { userId: 'user-regular-3', requestId: 'req-5' },
];

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.featureRequest.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Existing data cleared\n');

  // Create users
  console.log('👥 Creating users...');
  for (const user of users) {
    await prisma.user.create({ data: user });
    console.log(`  ✓ Created user: ${user.name} (${user.email})${user.isAdmin ? ' [ADMIN]' : ''}`);
  }
  console.log('');

  // Create feature requests
  console.log('📝 Creating feature requests...');
  for (const request of featureRequests) {
    const commentCount = comments.filter(c => c.requestId === request.id).length;
    await prisma.featureRequest.create({
      data: {
        ...request,
        commentCount,
      },
    });
    console.log(`  ✓ Created request: "${request.title}" [${request.status}]`);
  }
  console.log('');

  // Create comments
  console.log('💬 Creating comments...');
  // First, create parent comments (those without parentId)
  const parentComments = comments.filter(c => !c.parentId);
  const replyComments = comments.filter(c => c.parentId);

  for (const comment of parentComments) {
    await prisma.comment.create({ data: comment });
  }
  for (const comment of replyComments) {
    await prisma.comment.create({ data: comment });
  }
  console.log(`  ✓ Created ${comments.length} comments\n`);

  // Create votes
  console.log('👍 Creating votes...');
  for (const vote of votes) {
    await prisma.vote.create({
      data: {
        userId: vote.userId,
        requestId: vote.requestId,
      },
    });
  }
  console.log(`  ✓ Created ${votes.length} votes\n`);

  console.log('✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: ${users.length} (${users.filter(u => u.isAdmin).length} admin)`);
  console.log(`   - Feature Requests: ${featureRequests.length}`);
  console.log(`   - Comments: ${comments.length}`);
  console.log(`   - Votes: ${votes.length}`);
  console.log('\n🏷️  Available tags:', TAGS.join(', '));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
