# Feature Request Portal

A modern, interactive feature request portal for enterprise users built with Next.js 14, featuring AI-powered duplicate detection and summarization using Meta's Llama API.

![Feature Request Portal](https://img.shields.io/badge/Next.js-14+-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue) ![Prisma](https://img.shields.io/badge/Prisma-ORM-green)

## Features

### Core Functionality
- ✅ **Submit Feature Requests** - Users can submit feature requests with markdown support
- ✅ **Voting System** - Upvote/downvote with optimistic UI updates (one vote per user)
- ✅ **Threaded Comments** - Two-level comment threading with edit/delete functionality
- ✅ **Search & Sort** - Filter by trending, most voted, newest, or oldest
- ✅ **Status Tracking** - Under Review, Planned, In Progress, Implemented, Declined

### AI Integration (Llama API)
- 🤖 **Auto-Summarization** - AI generates concise summaries of new requests
- 🤖 **Duplicate Detection** - AI detects similar requests before submission
- 🤖 **Merge Suggestions** - Option to merge duplicate submissions

### Admin Features (Meta Employees Only)
- 🔒 **Protected Admin Dashboard** - `/admin` route for Meta employees
- 🔒 **Status Management** - Change request status, pin important requests
- 🔒 **Admin Notes** - Add internal notes (admin-only visibility)
- 🔒 **Bulk Operations** - Bulk status changes and deletions
- 🔒 **Comment Moderation** - Delete any comment

### Design
- 🎨 **Dark Theme** - Near-black background with purple/violet accents
- 🎨 **Responsive Layout** - Sidebar on desktop, list view on mobile
- 🎨 **Accessibility** - ARIA labels, keyboard navigation, focus states

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Database**: Vercel Postgres with Prisma ORM
- **Styling**: Tailwind CSS with custom dark theme
- **Authentication**: NextAuth.js with Google OAuth
- **AI**: Meta's public Llama API (api.llama.com)
- **Deployment**: Optimized for Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Vercel account (for database)
- A Google Cloud account (for OAuth)
- A Llama API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feature-requests-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then fill in your values (see Configuration section below).

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (Vercel Postgres)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NO_SSL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Llama API
LLAMA_API_KEY=

# NextAuth.js
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Setting Up Vercel Postgres

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database** → **Postgres**
3. Copy the connection strings from the **Quickstart** tab
4. Paste them into your `.env.local` file

Or use the Vercel CLI:
```bash
vercel env pull .env.local
```

### Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-app.vercel.app` (production)
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-app.vercel.app/api/auth/callback/google` (production)
8. Copy the Client ID and Client Secret

### Obtaining a Llama API Key

1. Visit [llama.developer.meta.com](https://llama.developer.meta.com)
2. Sign in with your Meta account or create one
3. Navigate to the **API Keys** section
4. Click **Generate New Key**
5. Copy the key (format: `LLM|<app_id>|<secret>`)
6. Add to your `.env.local`: `LLAMA_API_KEY=your_key_here`

> **Note**: The Llama API key is optional. If not provided, AI features will fall back to basic functionality.

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Admin Access Control

Admin access is automatically granted to users with specific email domains:

- `@meta.com`
- `@fb.com`

When a user signs in with Google using one of these email domains, their `isAdmin` flag is automatically set to `true`.

**How it works:**
1. During sign-in, the `signIn` callback in NextAuth checks the email domain
2. The `isAdmin` flag is stored in the database and JWT token
3. The middleware protects `/admin` routes by checking the JWT
4. Non-admin users are redirected to the home page

## Deployment to Vercel

### Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel Dashboard or CLI:
   ```bash
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add NEXTAUTH_SECRET
   vercel env add LLAMA_API_KEY
   ```

### Using GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

### Post-Deployment

1. Update `NEXTAUTH_URL` to your production URL
2. Add your production URL to Google OAuth authorized origins and redirect URIs
3. Run database migrations:
   ```bash
   npx prisma db push
   ```
4. (Optional) Seed the database:
   ```bash
   npm run seed
   ```

## Project Structure

```
/app
  /page.tsx                 # Main feature request list
  /admin/page.tsx           # Admin dashboard
  /api
    /auth/[...nextauth]     # NextAuth.js routes
    /requests               # Feature request CRUD
    /ai/summarize           # AI summarization
    /ai/duplicates          # Duplicate detection
/components
  /FeatureRequestCard.tsx   # Request card in sidebar
  /FeatureRequestDetail.tsx # Full request view
  /SubmitRequestModal.tsx   # New request form
  /CommentThread.tsx        # Comment display/input
  /StatusBadge.tsx          # Status indicator
  /VoteButton.tsx           # Vote with optimistic UI
  /AdminPanel.tsx           # Admin controls
  /DuplicateDetectionModal.tsx
/lib
  /db.ts                    # Prisma client
  /auth.ts                  # NextAuth config
  /llama.ts                 # Llama API service
  /types.ts                 # TypeScript types
  /utils.ts                 # Utility functions
/prisma
  /schema.prisma            # Database schema
  /seed.ts                  # Seed data script
/middleware.ts              # Route protection
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run seed` | Seed database with sample data |

## Sample Data

The seed script creates:

- **4 Users**: 1 admin (`@meta.com`), 3 regular users
- **9 Feature Requests**: Various statuses, including one merged request
- **8 Comments**: Threaded discussions on requests
- **8 Votes**: Sample voting data

Predefined tags:
- UI/UX, Performance, API, Documentation, Mobile, Integration, Security, Accessibility

## Security Notes

⚠️ **Important Security Considerations:**

- All Llama API calls are server-side only (never exposed to client)
- API keys are stored in environment variables (never commit `.env.local`)
- Admin routes are protected by middleware
- User input is validated and sanitized
- CSRF protection via NextAuth.js

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and intended for internal use.
