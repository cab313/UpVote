// =============================================================================
// NextAuth.js Configuration
// =============================================================================
// Authentication setup with Google OAuth and admin domain detection
//
// ADMIN ACCESS CONTROL:
// Users with @meta.com or @fb.com email domains are automatically granted
// admin privileges. This is checked during sign-in and stored in the JWT.
//
// HOW TO SET UP GOOGLE OAUTH:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing one
// 3. Navigate to "APIs & Services" → "Credentials"
// 4. Click "Create Credentials" → "OAuth client ID"
// 5. Select "Web application"
// 6. Add authorized JavaScript origins:
//    - http://localhost:3000 (development)
//    - https://your-app.vercel.app (production)
// 7. Add authorized redirect URIs:
//    - http://localhost:3000/api/auth/callback/google (development)
//    - https://your-app.vercel.app/api/auth/callback/google (production)
// 8. Copy the Client ID and Client Secret to your .env.local file
// =============================================================================

import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './db';

// Admin email domains - users with these domains get automatic admin access
const ADMIN_DOMAINS = ['meta.com', 'fb.com'];

/**
 * Check if an email address belongs to an admin domain
 * @param email - The email address to check
 * @returns true if the email domain is in the admin list
 */
export function isAdminEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return ADMIN_DOMAINS.includes(domain);
}

// Extend NextAuth session types to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isAdmin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * Sign-in callback - runs when a user signs in
     * Updates the isAdmin flag based on email domain
     */
    async signIn({ user }) {
      if (user.email) {
        const isAdmin = isAdminEmail(user.email);

        // Update the user's isAdmin flag in the database
        await prisma.user.upsert({
          where: { email: user.email },
          update: { isAdmin },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            isAdmin,
          },
        });
      }
      return true;
    },

    /**
     * JWT callback - runs when a JWT is created or updated
     * Adds user ID and isAdmin flag to the token
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      // Always fetch the latest isAdmin status from the database
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, isAdmin: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.isAdmin = dbUser.isAdmin;
        } else {
          token.isAdmin = isAdminEmail(token.email);
        }
      }

      return token;
    },

    /**
     * Session callback - runs when a session is checked
     * Exposes user ID and isAdmin flag to the client
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};
